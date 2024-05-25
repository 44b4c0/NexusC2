from django.urls import path, include
from . import views

urlpatterns = [
    path('_getusers/<str:api_key>', views.GetUsers),
    path('_getbots/<str:api_key>', views.GetBots),
    path('_getbotjoins/<str:api_key>', views.GetBotJoins),
    path('_getapiusage/<str:api_key>', views.GetAPIUsage),
]