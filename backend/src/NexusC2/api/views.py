from django.http import HttpResponse, JsonResponse
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth.models import User
from ui.models import Bot, Request, Broadcast, RegisterJoin, Settings, UserClass, RegisterJoin, Settings
from .models import APIUsage
from django.core.serializers import serialize

def GetUsers(request, **kwargs):
    if request.method == 'GET':
        settings = Settings.objects.first()
        if settings.api_usage_enabled == False:
            return JsonResponse({'api_usage': 'disabled'}, status=503)

        api_key = kwargs.get('api_key')
        try:
            user_is = UserClass.objects.get(api_key=api_key)
            user = user_is.user

            if user.is_active == False:
                return JsonResponse({'user_active': False}, status=401)

            users = User.objects.all()
            json_data = []

            for user in users:
                user_json_data = {
                    'username': user.username,
                    'is_active': user.is_active,
                    'date_of_join': user.date_joined.strftime("%d-%m-%Y"),
                }
                json_data.append(user_json_data)

            new_api_usage = APIUsage.objects.create()
            new_api_usage.save()
            return JsonResponse(json_data, status=200, safe=False)
        except:
            return JsonResponse({'api_key': 'invalid'}, status=401)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)
def GetBots(request, **kwargs):
    if request.method == 'GET':
        settings = Settings.objects.first()
        if settings.api_usage_enabled == False:
            return JsonResponse({'api_usage': 'disabled'}, status=503)

        api_key = kwargs.get('api_key')
        try:
            user_is = UserClass.objects.get(api_key=api_key)
            user = user_is.user

            if user.is_active == False:
                return JsonResponse({'user_active': False}, status=401)

            bots = Bot.objects.all()
            json_data = []

            for bot in bots:
                bot_json_data = {
                    'ip_address': bot.ip_address,
                    'os': bot.os,
                    'hostname': bot.hostname,
                    'user': bot.user,
                    'date_of_join': bot.date_of_join,
                    'room_id': bot.room_id,
                    'is_online': bot.is_online,
                    'is_being_used': bot.is_being_used,
                    'id': bot.id,
                }
                json_data.append(bot_json_data)

            new_api_usage = APIUsage.objects.create()
            new_api_usage.save()
            return JsonResponse(json_data, status=200, safe=False)
        except:
            return JsonResponse({'api_key': 'invalid'}, status=401)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)
def GetBotJoins(request, **kwargs):
    if request.method == 'GET':
        settings = Settings.objects.first()
        if settings.api_usage_enabled == False:
            return JsonResponse({'api_usage': 'disabled'}, status=503)

        api_key = kwargs.get('api_key')
        try:
            user_is = UserClass.objects.get(api_key=api_key)
            user = user_is.user

            if user.is_active == False:
                return JsonResponse({'user_active': False}, status=401)

            register_join_count = RegisterJoin.objects.count()
            new_api_usage = APIUsage.objects.create()
            new_api_usage.save()
            return JsonResponse({'bot_joins': register_join_count}, status=200)
        except:
            return JsonResponse({'api_key': 'invalid'}, status=401)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)
def GetAPIUsage(request, **kwargs):
    if request.method == 'GET':
        settings = Settings.objects.first()
        if settings.api_usage_enabled == False:
            return JsonResponse({'api_usage': 'disabled'}, status=503)

        api_key = kwargs.get('api_key')
        try:
            user_is = UserClass.objects.get(api_key=api_key)
            user = user_is.user

            if user.is_active == False:
                return JsonResponse({'user_active': False}, status=401)

            api_usage_count = APIUsage.objects.count()
            new_api_usage = APIUsage.objects.create()
            new_api_usage.save()
            return JsonResponse({'api_usage': api_usage_count}, status=200)
        except:
            return JsonResponse({'api_key': 'invalid'}, status=401)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)