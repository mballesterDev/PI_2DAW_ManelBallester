from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # ya lo tienes
    username = models.CharField(unique=True)  # ya lo tienes

    # ---- Campos para suscripción premium ----
    is_premium = models.BooleanField(default=False)
    premium_until = models.DateTimeField(null=True, blank=True)  
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    subscription_cancel_at_period_end = models.BooleanField(default=False)


    def activate_premium(self, months=1):
        """Activa premium y añade meses a la fecha de expiración."""
        self.is_premium = True
        if self.premium_until and self.premium_until > timezone.now():
            self.premium_until += timedelta(days=30 * months)
        else:
            self.premium_until = timezone.now() + timedelta(days=30 * months)
        self.save()

    def check_premium_status(self):
        """Verifica si sigue siendo premium."""
        if self.premium_until and self.premium_until > timezone.now():
            self.is_premium = True
        else:
            self.is_premium = False
        self.save()
        return self.is_premium
