from django.urls import path
from .views import (
    create_checkout_session,
    stripe_webhook,
    create_customer_portal_session,
    verify_subscription
)

urlpatterns = [
    path('create-checkout-session/', create_checkout_session, name='create-checkout-session'),
    path('stripe/webhook/', stripe_webhook, name='stripe-webhook'),
    path('customer-portal/', create_customer_portal_session, name='customer-portal'),
    path('verify-subscription/', verify_subscription, name='verify-subscription'),
]