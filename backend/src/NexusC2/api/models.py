from django.db import models

class APIUsage(models.Model):
    date_of_use = models.DateTimeField(auto_now_add=True, editable=False)