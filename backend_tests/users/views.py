from django.http import JsonResponse, HttpResponse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
import stripe
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

User = get_user_model()
stripe.api_key = settings.STRIPE_SECRET_KEY

# Mapea price_id a meses para premium_until
PRICE_PLAN_MAP = {
    "price_mensual_xxx": 1,
    "price_trimestral_xxx": 3,
    "price_anual_xxx": 12,
    # Añade tus price_id reales
    "price_2min_xxx": 0.07,  # 2 minutos ~ 0.07 meses para pruebas
}

def activate_user_premium(user, price_id):
    months = PRICE_PLAN_MAP.get(price_id, 1)
    user.is_premium = True
    if user.premium_until and user.premium_until > timezone.now():
        user.premium_until += timedelta(days=30 * months)
    else:
        user.premium_until = timezone.now() + timedelta(days=30 * months)
    user.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subscription(request):
    user = request.user
    is_active = (
        user.is_premium and
        user.premium_until and
        user.premium_until > timezone.now()
    )
    data = {
        "is_active": is_active,
        "premium_until": user.premium_until.isoformat() if user.premium_until else None,
        "subscription_cancel_at_period_end": user.subscription_cancel_at_period_end,
    }
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    user = request.user
    subscription_id = user.stripe_subscription_id
    if subscription_id:
        try:
            stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            user.subscription_cancel_at_period_end = True
            user.save()
        except Exception as e:
            return Response({"error": str(e)}, status=400)
    else:
        return Response({"error": "No subscription id found for user"}, status=400)

    return Response({"detail": "Subscription will be canceled at period end."})

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import CustomUserSerializer
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

def check_email(request):
    email = request.GET.get('email', None)
    if email is None:
        return JsonResponse({'error': 'Email no proporcionado'}, status=400)
    exists = User.objects.filter(email=email).exists()
    return JsonResponse({'exists': exists})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_customer_portal_session(request):
    logger.info("🚀 Portal hit!")
    user = request.user
    if not user.stripe_customer_id:
        return Response({'error': 'No Stripe customer ID'}, status=400)

    try:
        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url="http://localhost:5173/",  # Cambia a tu URL real
        )
        return Response({'url': session.url})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
