from django.conf import settings
from django.db import models

class Group(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_groups')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="user_groups")
    def __str__(self):
        return self.name
