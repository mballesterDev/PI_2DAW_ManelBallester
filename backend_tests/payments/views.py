# views.py
import stripe
import logging
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta, datetime, timezone as dt_timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY
User = get_user_model()

# Price IDs -> meses

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    price_id = request.data.get("price_id")
    if not price_id:
        return Response({"error": "Price ID required"}, status=400)

    try:
        user = request.user

        # Crear customer si no existe
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(email=user.email)
            user.stripe_customer_id = customer.id
            user.save()

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            customer=user.stripe_customer_id,
            line_items=[{"price": price_id, "quantity": 1}],
            success_url="http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:5173/error",
        )
        return Response({"url": session.url})
    except Exception as e:
        logger.error(f"Error creando checkout: {e}")
        return Response({"error": str(e)}, status=500)
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        print(f"❌ Error construyendo evento Stripe: {e}")
        return HttpResponse(status=400)

    event_type = event['type']
    data = event['data']['object']
    print(f"📩 Evento recibido: {event_type}")

    # Detectar customer_id
    customer_id = data.get('customer') or data.get('id')
    print(f"🆔 customer_id recibido: {customer_id}")

    # Buscar usuario por customer_id o email y vincular si es posible
    user = None
    if customer_id:
        try:
            user = User.objects.get(stripe_customer_id=customer_id)
            print(f"✅ Usuario encontrado por customer_id: {user.email}")
        except User.DoesNotExist:
            print(f"⚠️ No se encontró usuario con stripe_customer_id={customer_id}")

            # Intentar vincular por email si existe
            email = None
            if 'customer_email' in data:
                email = data['customer_email']
            elif 'email' in data:
                email = data['email']
            elif 'customer_details' in data:
                email = data['customer_details'].get('email')

            if email:
                try:
                    user = User.objects.get(email=email)
                    print(f"🔄 Vinculando customer_id {customer_id} al usuario {user.email}")
                    user.stripe_customer_id = customer_id
                    user.save()
                except User.DoesNotExist:
                    print(f"❌ No existe usuario con email {email}")

    if not user:
        print("🚫 No se encontró un usuario para este evento")
        return HttpResponse(status=404)

    def update_premium_until_from_subscription(sub_data):
        items = sub_data.get('items', {}).get('data', [])
        if items:
            current_period_end_ts = items[0].get('current_period_end')
            if current_period_end_ts:
                new_premium_until = datetime.fromtimestamp(current_period_end_ts, tz=dt_timezone.utc)
                print(f"⏳ premium_until antes: {user.premium_until} → asignando: {new_premium_until}")
                user.premium_until = new_premium_until

    # Manejo de eventos
    if event_type == 'customer.subscription.updated' or event_type == 'customer.subscription.created':
        status = data.get('status')
        cancel_at_period_end = data.get('cancel_at_period_end', False)
        print(f"🔄 Actualizando suscripción: estado={status}, cancel_at_period_end={cancel_at_period_end}")
        update_premium_until_from_subscription(data)
        user.is_premium = status in ['active', 'trialing']
        user.subscription_cancel_at_period_end = cancel_at_period_end
        user.stripe_subscription_id = data.get('id')
        user.save()
        print(f"✅ Usuario {user.email} actualizado correctamente")

    elif event_type == 'customer.subscription.deleted':
        user.is_premium = False
        user.premium_until = None
        user.stripe_subscription_id = None
        user.subscription_cancel_at_period_end = False
        user.save()
        print(f"🛑 Suscripción eliminada para {user.email}")

    elif event_type == 'checkout.session.completed':
        subscription_id = data.get('subscription')
        if subscription_id:
            subscription = stripe.Subscription.retrieve(subscription_id)
            status = subscription.status
            print(f"✅ checkout.session.completed: subscription status {status}")
            update_premium_until_from_subscription(subscription)
            user.is_premium = status in ['active', 'trialing']
            user.stripe_subscription_id = subscription_id
            user.save()
            print(f"✅ Usuario {user.email} activado premium en checkout.session.completed")

    elif event_type in ['invoice.paid', 'invoice.payment_succeeded']:
        subscription_id = data.get('subscription')
        if subscription_id:
            subscription = stripe.Subscription.retrieve(subscription_id)
            status = subscription.status
            print(f"✅ {event_type}: subscription status {status}")
            update_premium_until_from_subscription(subscription)
            user.is_premium = status in ['active', 'trialing']
            user.save()
            print(f"✅ Usuario {user.email} actualizado por pago de factura")

    elif event_type == 'invoice.payment_failed':
        user.is_premium = False
        user.subscription_cancel_at_period_end = False
        user.premium_until = None
        user.save()
        print(f"💸 Pago fallido para {user.email}")

    else:
        print(f"ℹ️ Evento no manejado: {event_type}")

    return HttpResponse(status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_subscription(request):
    user = request.user
    user.check_premium_status()  # fuerza a comprobar si ya expiró
    if user.is_premium and user.stripe_subscription_id:
        return Response({"success": True})
    else:
        return Response({"success": False, "error": "Subscription not active"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_customer_portal_session(request):
    logger.info("🚀 Portal hit!")
    print("🚀 Portal endpoint hit!")  # Para consola

    # Mostrar headers y usuario para debug
    print("📌 Request headers:", dict(request.headers))
    print("📌 Authenticated user:", request.user)
    print("📌 Is authenticated:", request.user.is_authenticated)

    user = request.user

    if not user.is_authenticated:
        print("❌ User is NOT authenticated")
        return Response({'error': 'User not authenticated'}, status=403)

    print("✅ User is authenticated")

    if not getattr(user, 'stripe_customer_id', None):
        print("❌ No Stripe customer ID found for user:", user)
        return Response({'error': 'No Stripe customer ID'}, status=400)

    print(f"✅ Stripe customer ID found: {user.stripe_customer_id}")

    try:
        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url="http://localhost:5173/",  # Cambia a tu URL real
        )
        print("✅ Stripe portal session created:", session.url)
        return Response({'url': session.url})
    except Exception as e:
        print("❌ Error creating Stripe portal session:", str(e))
        logger.error(f"Stripe portal error: {e}")
        return Response({'error': str(e)}, status=500)