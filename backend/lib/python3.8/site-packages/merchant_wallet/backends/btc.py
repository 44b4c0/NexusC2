import datetime
import bitcoin as btc
from forex_python.bitcoin import BtcConverter
import blockcypher


def convert_from_satoshi(amount):
    """
    Convert a particular satoshi amount to btc
    :param amount: Amount in satoshi unit
    :return: converted btc amount
    """
    return blockcypher.from_base_unit(amount, "btc")


def get_address_details(address, coin_symbol="btc"):
    """
    Get current transaction details of an address as returned by blockcypher
    :param address: btc address
    :return: transaction and balance information
    """
    return blockcypher.get_address_details(address, coin_symbol=coin_symbol)


def get_transaction_details(transaction_hash, coin_symbol="btc"):
    """
    Get current transaction details of an hash as returned by blockcypher
    :param transaction_hash: btc address
    :return: transaction and balance information
    """
    return blockcypher.get_transaction_details(
        transaction_hash, coin_symbol=coin_symbol
    )


def extract_latest_transaction(transactions, key="received"):
    transaction_hash = max(transactions, key=lambda x: x[key])
    return transaction_hash


def confirm_transaction_date_without_previous_hash(
    transaction, accept_confirmed_bal_without_hash_mins, key="received"
):
    """
    Check a btc transaction date if it occured before a particular time
    :param transaction: Transaction to check
    :param accept_confirmed_bal_without_hash_mins:
    :return: None if transaction happened before a particular time else transaction
    """

    if transaction[key].replace(tzinfo=datetime.timezone.utc) >= (
        datetime.datetime.utcnow()
        - datetime.timedelta(minutes=accept_confirmed_bal_without_hash_mins)
    ).replace(tzinfo=datetime.timezone.utc):
        return transaction
    return None


class BitcoinBackend:
    UNCONFIRMED_ADDRESS_BALANCE = 0
    CONFIRMED_ADDRESS_BALANCE = 1
    UNDERPAID_ADDRESS_BALANCE = -1
    NO_HASH_ADDRESS_BALANCE = -2

    def __init__(self, public_key):
        self.public_key = public_key
        self.converter = BtcConverter()

    def get_address_output_value(self, address, outputs):
        for output in outputs:
            if address in output["addresses"]:
                return output["value"]

    def generate_new_address(self, index):
        """
        Generate new bitcoin address from a hd public master key based on a particlar index
        Address can be generated sequentially like in the case of electrum
        :param index: Index to use to generate address
        :return: Generated address
        """
        address = btc.pubkey_to_address(btc.bip32_descend(self.public_key, [0, index]))
        return address

    def convert_from_fiat(self, amount, currency="USD"):
        """
        Convert a fiat amount to bitcoin
        :param amount: Fiat amount to convert
        :param currency: Fiat currency
        :return: Rounded btc amount
        """
        res = self.converter.convert_to_btc(amount, currency)
        return round(res, 8)

    def convert_to_fiat(self, amount, currency):
        """
        Convert a btc amount to fiat amount
        :param amount: BTC amount to convert
        :param currency: Fiat currency to convert
        :return: Amount in specified currency
        """
        res = self.converter.convert_btc_to_cur(amount, currency)
        return round(res, 2)

    def confirm_address_payment(
        self,
        address,
        total_crypto_amount,
        confirmation_number=1,
        accept_confirmed_bal_without_hash_mins=20,
        tx_hash=None,
    ):
        """
        Confirm if a payment was made to a specified address.
        A payment that was already confirmed on the blockchain before running
        this tool can still be seen as paid by specifying a time
        frame such payment was confirmed and the time this tool is used on accept_confirmed_bal_without_hash_mins.
        :param address: Address to check for payment
        :param total_crypto_amount: Amount to check
        :param accept_confirmed_bal_without_hash_mins : You can accept already confirmed payment within this minute
         if there is no previous hash provided
        :param tx_hash: Transaction hash if any can be gotten from this method if payment is unconfirmed
        :param confirmation_number: Block chain confirmations below this are returned as unconfirmed
        :return: UNCONFIRMED_ADDRESS_BALANCE, traansaction hash | CONFIRMED_ADDRESS_BALANCE, payment_amount |
                    UNDERPAID_ADDRESS_BALANCE, remaining_crypto_amount |  NO_HASH_ADDRESS_BALANCE, None
        """
        if tx_hash:
            transaction = get_transaction_details(transaction_hash=tx_hash)
            value = self.get_address_output_value(address, transaction["outputs"])
            if value is None:
                return self.NO_HASH_ADDRESS_BALANCE, None
            return self._check_balance_confirmations(
                transaction["confirmations"],
                transaction["hash"],
                confirmation_number,
                value,
                total_crypto_amount,
            )
        data = get_address_details(address)
        if data["unconfirmed_balance"] != 0 and data["unconfirmed_n_tx"] > 0:
            return (
                self.UNCONFIRMED_ADDRESS_BALANCE,
                extract_latest_transaction(data["unconfirmed_txrefs"])["tx_hash"],
            )

        elif (
            data["unconfirmed_balance"] == 0
            and data["unconfirmed_n_tx"] == 0
            and data["total_received"] > 0
            and data["n_tx"] > 0
        ):

            transaction = extract_latest_transaction(data["txrefs"], key="confirmed")
            if tx_hash == transaction["tx_hash"]:
                value = transaction["value"]
            elif tx_hash:

                transaction = get_transaction_details(transaction_hash=tx_hash)
                value = self.get_address_output_value(address, transaction["outputs"])
                if value is None:
                    return self.NO_HASH_ADDRESS_BALANCE, None
            else:
                # There is a confirmed balance and we dont have any old  hash to track it
                transaction = confirm_transaction_date_without_previous_hash(
                    transaction, accept_confirmed_bal_without_hash_mins, key="confirmed"
                )
                if transaction is None:
                    return self.NO_HASH_ADDRESS_BALANCE, None
                value = transaction["value"]

            return self._check_balance_confirmations(
                transaction["confirmations"],
                transaction["tx_hash"],
                confirmation_number,
                value,
                total_crypto_amount,
            )
        else:
            return self.NO_HASH_ADDRESS_BALANCE, None

    def _check_balance_confirmations(
        self,
        transaction_confirmations,
        tx_hash,
        confirmation_number,
        sent_value,
        total_crypto_amount,
    ):
        if transaction_confirmations < confirmation_number:
            return self.UNCONFIRMED_ADDRESS_BALANCE, tx_hash
        sent_btc_amount = convert_from_satoshi(sent_value)
        if sent_btc_amount < total_crypto_amount:
            remaining_crypto_amount = total_crypto_amount - sent_btc_amount
            return self.UNDERPAID_ADDRESS_BALANCE, remaining_crypto_amount
        return self.CONFIRMED_ADDRESS_BALANCE, sent_value
