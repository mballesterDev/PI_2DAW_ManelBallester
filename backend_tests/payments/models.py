from django.db import models

# Create your models here.
# models.py
from django.db import models

class StripeWebhookEvent(models.Model):
    event_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
