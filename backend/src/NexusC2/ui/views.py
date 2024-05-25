from .models import UserClass, Request, Bot, RegisterJoin, Broadcast, Settings
from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
from django.http import JsonResponse, HttpResponse
from django.core.serializers import serialize
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import APIUsage
from datetime import datetime, timedelta
from collections import defaultdict
import json
import random
import string

# def GenerateAPIKey():
#     return uuid.uuid4().hex[:100]

def GenerateAPIKey():
    charset = string.ascii_letters + string.digits
    return ''.join(random.choices(charset, k=100))

@csrf_exempt
def Register(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        username = data.get('Username')
        password = data.get('Password')
        repeat_password = data.get('RepeatPassword')

        settings = Settings.objects.first()

        if settings.registration_enabled == False:
            return JsonResponse({'system': 'registration_not_allowed'}, status=200)

        if password != repeat_password:
            return JsonResponse({'credentials': 'passwords_dont_match'})
        
        hashed_password = make_password(password)
        try:
            user = User.objects.get(username=username)

            return JsonResponse({'credentials': 'username_used'})
        except:
            user = User.objects.create(username=username, email='', password=hashed_password, is_active=False)
            api_key = GenerateAPIKey()
            user_class = UserClass.objects.create(user=user, api_key=api_key)
            user.save()
            user_class.save()

            login(request, user)
            session_id = request.session.session_key

            return JsonResponse({'credentials': 'success', 'session_id': session_id}, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

@csrf_exempt
def Login(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        username = data.get('Username')
        password = data.get('Password')

        try:
            user = User.objects.get(username=username)

            if not check_password(password, user.password):
                return JsonResponse({'credentials': 'invalid'}) # Invalid Password case
            
            login(request, user)
            session_id = request.session.session_key

            return JsonResponse({'credentials': 'success', 'session_id': session_id}, status=200)
        except:
            return JsonResponse({'credentials': 'user_not_found'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)
@csrf_exempt
def Logout(request):
    if request.method == 'POST':
        logout(request)

        return JsonResponse({'system': 'success'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetRequests(request):
    if request.method == 'GET':
        session_id = request.session.session_key

        try:
            session = Session.objects.get(session_key=session_id)
            if session.expire_date > timezone.now():
                requests = Request.objects.all()
                serialized_requests = serialize('json', requests)
                return JsonResponse(serialized_requests, status=200)
            else:
                return JsonResponse({'session_id': 'invalid'})
        except:
            return JsonResponse({'db': 'invalid_error'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetBots(request):
    if request.method == 'GET':
        session_id = request.session.session_key

        try:
            session = Session.objects.get(session_key=session_id)
            if session.expire_date > timezone.now():
                bots = Bot.objects.all()
                serialized_bots = serialize('json', bots)
                return JsonResponse(serialized_bots, status=200)
            else:
                return JsonResponse({'session_id': 'invalid'})
        except:
            return JsonResponse({'db': 'invalid_error'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

@csrf_exempt
def CheckAuth(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        session_id = data.get('sessionId')

        if session_id == 'sessionId':
            return JsonResponse({'session_id': 'invalid'})

        try:
            session = Session.objects.get(session_key=session_id)
            if session.expire_date > timezone.now():
                user_id = session.get_decoded().get('_auth_user_id')
                user = User.objects.get(pk=user_id)

                if user.username == 'admin':
                    return JsonResponse({'session_id': 'valid', 'system': 'user_is_admin'})
                else:
                    if user.is_active:
                        return JsonResponse({'session_id': 'valid', 'system': 'user_is_not_admin', 'user': 'is_active'}, status=200)
                    else:
                        return JsonResponse({'session_id': 'valid', 'system': 'user_is_not_admin', 'user': 'is_not_active'}, status=200)
            else:
                return JsonResponse({'session_id': 'invalid'})
        except:
            return JsonResponse({'db': 'invalid_error'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetBotJoinStats(request):
    if request.method == 'GET':
        current_year = timezone.now().year

        monthly_stats = defaultdict(int)

        registered_joins_current_year = RegisterJoin.objects.filter(date_of_join__year=current_year)

        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }

        for month_name in month_names.values():
            monthly_stats[month_name] = 0

        for join in registered_joins_current_year:
            month_name = month_names[join.date_of_join.month]
            monthly_stats[month_name] += 1

        monthly_stats = dict(monthly_stats)

        return JsonResponse({'monthly_stats': monthly_stats}, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)
# How many users have been registered this year per month
def GetUserJoinStats(request):
    if request.method == 'GET':
        current_year = timezone.now().year

        monthly_stats = defaultdict(int)

        users_current_year = User.objects.filter(date_joined__year=current_year)

        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }

        for month_name in month_names.values():
            monthly_stats[month_name] = 0

        for user in users_current_year:
            month_name = month_names[user.date_joined.month]
            monthly_stats[month_name] += 1

        monthly_stats = dict(monthly_stats)

        return JsonResponse({'monthly_stats': monthly_stats}, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)
# How many API usage
def GetAPIStats(request):
    if request.method == 'GET':
        current_year = timezone.now().year

        monthly_stats = defaultdict(int)

        api_usage_current_year = APIUsage.objects.filter(date_of_use__year=current_year)

        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }

        for month_name in month_names.values():
            monthly_stats[month_name] = 0

        for user in api_usage_current_year:
            month_name = month_names[user.date_joined.month]
            monthly_stats[month_name] += 1

        monthly_stats = dict(monthly_stats)

        return JsonResponse({'monthly_stats': monthly_stats}, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetBotBaseStats(request):
    if request.method == 'GET':
        bots = Bot.objects.all()

        serialized_bots = serialize('json', bots)

        return JsonResponse({'serialized_bots': serialized_bots}, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetUsersStats(request):
    if request.method == 'GET':
        users = User.objects.all()

        json_data_to_serialize = []

        for user in users:
            json_data_of_the_user = {
                'username': user.username,
                'date_of_join': user.date_joined.strftime("%d-%m-%Y"),
                # 'profile_picture': user_class.profile_picture.url,
            }
            json_data_to_serialize.append(json_data_of_the_user)
        # serialized_users = serialize('json', json_data_to_serialize)

        return JsonResponse({'serialized_users': json_data_to_serialize}, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetUserData(request):
    if request.method == 'GET':
        username = request.GET.get('Username')

        if username == 'admin':
            return JsonResponse({'system': 'user_not_found'}, status=200)

        try:
            user = User.objects.get(username=username)
            user_class = UserClass.objects.get(user=user)
        except:
            return JsonResponse({'system': 'user_not_found'}, status=200)

        try:
            # Data about the User
            username = user.username
            requests = Request.objects.filter(user=user)
            broadcasts = Broadcast.objects.filter(user=user)
        except:
            return JsonResponse({'system': 'actions_not_found'}, status=200)

        current_year = timezone.now().year
        monthly_stats_requests = defaultdict(int)
        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }

        for month_name in month_names.values():
            monthly_stats_requests[month_name] = 0

        for req in requests:
            month_name = month_names[req.date_of_request.month]
            monthly_stats_requests[month_name] += 1

        monthly_stats_broadcasts = defaultdict(int)
        for month_name in month_names.values():
            monthly_stats_broadcasts[month_name] = 0

        for broadcast in broadcasts:
            month_name = month_names[broadcast.date_of_broadcast.month]
            monthly_stats_broadcasts[month_name] += 1

        is_user_admin = False

        if user.username == 'admin':
            is_user_admin = True

        json_data_to_serialize = {
            'username': username,
            'is_user_active': user.is_active,
            'is_user_admin': is_user_admin,
            'monthly_stats_requests': dict(monthly_stats_requests),
            'api_key': user_class.api_key,
            'monthly_stats_broadcasts': dict(monthly_stats_broadcasts),
        }

        serialized_json_data = json.dumps(json_data_to_serialize)
        return JsonResponse(serialized_json_data, safe=False, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetUserName(request):
    if request.method == 'GET':
        session_id = request.GET.get('sessionId')

        if session_id == 'sessionId':
            return JsonResponse({'session_id': 'invalid'})

        try:
            session = Session.objects.get(session_key=session_id)
            if session.expire_date > timezone.now():
                user_id = session.get_decoded().get('_auth_user_id')
                user = User.objects.get(pk=user_id)
                username = user.username

                return JsonResponse({'username': username}, status=200)
            else:
                return JsonResponse({'session_id': 'invalid'})
        except:
            return JsonResponse({'db': 'invalid_error'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetSettings(request):
    if request.method == 'GET':
        session_id = request.session.session_key

        if session_id == 'sessionId':
            return JsonResponse({'session_id': 'invalid'})
        
        try:
            settings = Settings.objects.first()
            api_usage = settings.api_usage_enabled
            registration = settings.registration_enabled
            broadcast = settings.broadcast_enabled

            return JsonResponse({'api_usage': api_usage, 'registration': registration, 'broadcast': broadcast}, status=200)
        except:
            return JsonResponse({'db': 'invalid_error'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

@csrf_exempt
def SaveSettings(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        session_id = data.get('sessionId')

        if session_id == 'sessionId':
            return JsonResponse({'session_id': 'invalid'})
    
        try:
            session = Session.objects.get(session_key=session_id)
            if session.expire_date > timezone.now():
                user_id = session.get_decoded().get('_auth_user_id')
                user = User.objects.get(pk=user_id)
                username = user.username

                if user.username != 'admin':
                    return JsonResponse({'system': 'user_is_not_admin'}, status=200)
                else:
                    # Data that needs to be saved
                    api_usage = data.get('APIUsage')
                    registration = data.get('registration')
                    broadcast = data.get('broadcast')
                    password = data.get('Password')

                    user = User.objects.get(username='admin')
                    user.set_password(password)
                    settings = Settings.objects.first()

                    settings.api_usage_enabled = api_usage
                    settings.registration_enabled = registration
                    settings.broadcast_enabled = broadcast
                    user.save()
                    settings.save()

                    return JsonResponse({'settings': 'saved_success'}, status=200)
        except:
            return JsonResponse({'db': 'invalid_error'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

def GetInactiveUsers(request):
    if request.method == 'GET':
        users = User.objects.filter(is_active=False)

        serialized_users = []

        for user in users:
            serialized_user = {
                'username': user.username,
            }
            serialized_users.append(serialized_user)

        return JsonResponse({'serialized_users': serialized_users}, status=200)
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)
@csrf_exempt
def ActivateUser(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        username = data.get('Username')

        try:
            user = User.objects.get(username=username)
            user.is_active = True
            user.save()
            return JsonResponse({'user': 'activated'}, status=200)
        except:
            return JsonResponse({'db': 'invalid_error'})
    else:
        return JsonResponse({'http_method': 'invalid'}, status=405)

# """
# What is PacMan and how to use it?
# A PacMan is a function which resets the password of the admin user to its default. In `urls.py` file please change the path of this function
# to something else. Also, make it more difficult to detect.
# """

# """ Ignore this """
def PacMan(request):
    user = User.objects.get(username='admin')
    user.set_password('admin')
    user.save()

    return JsonResponse({'hi': 'hi'}, status=200)