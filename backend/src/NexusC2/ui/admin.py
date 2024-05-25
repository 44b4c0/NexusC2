from django.contrib import admin
from .models import UserClass, RegisterJoin, Bot, Request, Broadcast, Settings
from django.contrib.sessions.models import Session

admin.site.register(UserClass)

admin.site.register(RegisterJoin)
admin.site.register(Bot)

admin.site.register(Request)
admin.site.register(Broadcast)

admin.site.register(Settings)
admin.site.register(Session)