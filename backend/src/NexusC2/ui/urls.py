from django.urls import path, include
from . import views

urlpatterns = [
    path('login/', views.Login),

    path('register/', views.Register),
    path('logout/', views.Logout),
    path('PacMan/', views.PacMan), # """ Ignore this or reset this to something else """

    # """ Utilities """
    path('_checkauth/', views.CheckAuth),
    path('_getrequests/', views.GetRequests),
    path('_getbotstats/', views.GetBotJoinStats),
    path('_getuserstats/', views.GetUserJoinStats),
    path('_getapistats/', views.GetAPIStats),

    path('_getbotbasestats/', views.GetBotBaseStats),
    path('_getusersstats/', views.GetUsersStats),
    path('_getuserdata/', views.GetUserData),
    path('_getusername/', views.GetUserName),
    path('_getinactiveusers/', views.GetInactiveUsers),

    path('_activateuser/', views.ActivateUser),
    path('_getsettings/', views.GetSettings),
    path('_setsettings/', views.SaveSettings),
]