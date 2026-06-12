from django.contrib import admin
from django.urls import path, include
from rest_framework import routers, permissions
from django.contrib.auth import views as auth_views


from tests_api.views import *  # Cambia 'tu_app' por el nombre real de tu app
from tests_api.urls import *  
from rest_framework.authtoken.views import obtain_auth_token


# Importa drf_yasg para la documentación
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = routers.DefaultRouter()
router.register(r'exercises', ExerciseViewSet)

schema_view = get_schema_view(
   openapi.Info(
      title="Testeate API",
      default_version='v1',
      description="Documentación de la API para el frontend",
      contact=openapi.Contact(email="tuemail@ejemplo.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API REST
    path('api/', include(router.urls)),
    path('api/', include('tests_api.urls')),

    # Autenticación
    path('accounts/', include('allauth.urls')),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('dj-rest-auth/social/', include('allauth.socialaccount.urls')),
    path("api-token-auth/", obtain_auth_token),
     path('api/', include('accounts.urls')),
     path(
        'dj-rest-auth/password/reset/confirm/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(template_name='registration/password_reset_confirm.html'),
        name='password_reset_confirm',
    ),

    # Documentación Swagger / Redoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
     path('', include('users.urls')), 
     
     path('api/', include('results.urls')),
     path('api/', include('groups.urls')),
     path('payments/', include('payments.urls')),  

]




