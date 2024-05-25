import unittest
import datetime
from merchant_wallet.backends.btc import (
    convert_from_satoshi,
    extract_latest_transaction,
    confirm_transaction_date_without_previous_hash,
    BitcoinBackend,
    get_address_details,
    get_transaction_details,
)


class TestMerchantWallet(unittest.TestCase):
    def setUp(self):
        public_key = "xpub6BfKpqjTwvH21wJGWEfxLppb8sU7C6FJge2kWb9315oP4ZVqCXG29cdUtkyu7YQhHyfA5nt63nzcNZHYmqXY" \
                     "HDxYo8mm1Xq1dAC7YtodwUR"
        self.backend = BitcoinBackend(public_key)

    def test_satoshi_btc_convert(self):
        self.assertEqual(1, convert_from_satoshi(100000000))
        self.assertEqual(0.07877000, convert_from_satoshi(7877000))
        self.assertEqual(0.09065697, convert_from_satoshi(9065697))

    def test_extract_latest_transaction_by_received_date(self):
        selected_transaction = {
            "received": datetime.datetime.now() + datetime.timedelta(days=5)
        }
        other_date = datetime.datetime.now() + datetime.timedelta(days=2)
        other_date_one = datetime.datetime.now() - datetime.timedelta(days=4)
        other_date_two = datetime.datetime.now() - datetime.timedelta(days=7)
        transactions = [
            {"received": datetime.datetime.now()},
            selected_transaction,
            {"received": other_date_one},
            {"received": other_date_two},
            {"received": other_date},
        ]

        self.assertEqual(selected_transaction, extract_latest_transaction(transactions))

    def test_confirm_transaction_date_without_previous_hash(self):
        selected_transaction = {
            "received": datetime.datetime.utcnow() - datetime.timedelta(days=1)
        }
        transaction = confirm_transaction_date_without_previous_hash(
            selected_transaction, 25 * 60
        )
        self.assertEqual(selected_transaction, transaction)
        transaction = confirm_transaction_date_without_previous_hash(
            selected_transaction, 60
        )
        self.assertIsNone(transaction)

    def test_generate_new_address(self):
        self.assertEqual(
            self.backend.generate_new_address(0), "1Ge6rDuyCdYVGhXZjcK4251q67GXMKx6xK"
        )
        self.assertEqual(
            self.backend.generate_new_address(1), "1NVsB73WmDGXSxv77sh9PZENH2x3RRnkDY"
        )

    def test_can_get_adddres_details(self):
        address = "1NVsB73WmDGXSxv77sh9PZENH2x3RRnkDY"
        data = get_address_details("1NVsB73WmDGXSxv77sh9PZENH2x3RRnkDY")
        # print(data)
        self.assertEqual(data["address"], address)

    def test_convert_from_fiat(self):
        result = self.backend.convert_from_fiat(0.01, "USD")
        self.assertEqual(type(result), float)

    def test_convert_to_fiat(self):
        result = self.backend.convert_to_fiat(1, "EUR")
        self.assertEqual(type(result), float)

    def test_get_transaction_details(self):
        hash_value = "cf66b1f816830bd5258f915326a0cc9c4bde37818cfc63e97f9fb1a40d360957"
        res = get_transaction_details(hash_value)
        self.assertEqual(res["hash"], hash_value)

    def test_confirm_address_payment(self):
        res, _ = self.backend.confirm_address_payment(
            "1Ge6rDuyCdYVGhXZjcK4251q67GXMKx6xK", 0.01, confirmation_number=5000
        )
        self.assertEqual(res, self.backend.NO_HASH_ADDRESS_BALANCE)
        res, _ = self.backend.confirm_address_payment(
            "1Ge6rDuyCdYVGhXZjcK4251q67GXMKx6xK",
            0.01,
            confirmation_number=200,
            accept_confirmed_bal_without_hash_mins=5256000,
        )
        self.assertEqual(res, self.backend.UNDERPAID_ADDRESS_BALANCE)
        res, _ = self.backend.confirm_address_payment(
            "1Ge6rDuyCdYVGhXZjcK4251q67GXMKx6xK",
            0.00009517,
            confirmation_number=200,
            accept_confirmed_bal_without_hash_mins=5256000,
        )
        self.assertEqual(res, self.backend.CONFIRMED_ADDRESS_BALANCE)

    def test_confirm_address_payment_with_hash(self):

        res, _ = self.backend.confirm_address_payment(
            "1E5i2RkxNQi7FC8fbXPoZZG8iHNHtwgVNQ",
            0.00176959,
            tx_hash="cf66b1f816830bd5258f915326a0cc9c4bde37818cfc63e97f9fb1a40d360957",
            confirmation_number=500000,
        )
        self.assertEqual(res, self.backend.UNCONFIRMED_ADDRESS_BALANCE)
        res, _ = self.backend.confirm_address_payment(
            "1E5i2RkxNQi7FC8fbXPoZZG8iHNHtwgVNQ",
            0.01176959,
            tx_hash="cf66b1f816830bd5258f915326a0cc9c4bde37818cfc63e97f9fb1a40d360957",
            confirmation_number=50,
        )
        self.assertEqual(res, self.backend.UNDERPAID_ADDRESS_BALANCE)
        res, _ = self.backend.confirm_address_payment(
            "1E5i2RkxNQi7FC8fbXPoZZG8iHNHtwgVNQ",
            0.00176959,
            tx_hash="cf66b1f816830bd5258f915326a0cc9c4bde37818cfc63e97f9fb1a40d360957",
            confirmation_number=50,
        )
        self.assertEqual(res, self.backend.CONFIRMED_ADDRESS_BALANCE)
