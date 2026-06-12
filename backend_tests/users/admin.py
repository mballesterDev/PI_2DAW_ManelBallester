from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Campos que se mostrarán en la lista de usuarios en admin
    list_display = (
        "username",
        "email",
        "is_premium",
        "premium_until",
        "stripe_customer_id",
        "stripe_subscription_id",
        "subscription_cancel_at_period_end",
        "is_staff",
        "is_active",
        "date_joined",
    )
    # Filtros para facilitar búsqueda en el admin
    list_filter = (
        "is_premium",
        "is_staff",
        "is_active",
        "date_joined",
    )

    # Campos que se pueden buscar
    search_fields = ("username", "email", "stripe_customer_id", "stripe_subscription_id")

    # Agrupación de campos en el formulario de edición de usuario
    fieldsets = UserAdmin.fieldsets + (
        ("Premium Subscription", {
            "fields": (
                "is_premium",
                "premium_until",
                "stripe_customer_id",
                "stripe_subscription_id",
                "subscription_cancel_at_period_end",
            ),
        }),
    )

    # Opcional: campos que se pueden editar directamente desde la lista (como activar/desactivar premium)
    list_editable = ("is_premium", "premium_until")

    ordering = ("-date_joined",)
