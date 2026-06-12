from django.db import IntegrityError
from rest_framework import serializers
from allauth.account.adapter import get_adapter
from django.contrib.auth import get_user_model
from dj_rest_auth.serializers import UserDetailsSerializer
from rest_framework import serializers
from .models import CustomUser

User = get_user_model()

class CustomRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return email

    def validate_username(self, username):
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("Este username ya está registrado.")
        return username

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return data

    def save(self, request):
        adapter = get_adapter()
        try:
            user = adapter.new_user(request)
            user.username = self.validated_data['username']
            user.email = self.validated_data['email']
            user.set_password(self.validated_data['password1'])
            user.save()
            adapter.save_user(request, user, self)
            return user
        except IntegrityError as e:
            if 'email' in str(e).lower():
                raise serializers.ValidationError({"email": ["Este email ya está registrado."]})
            if 'username' in str(e).lower():
                raise serializers.ValidationError({"username": ["Este username ya está registrado."]})
            raise serializers.ValidationError({"non_field_errors": ["Error al guardar el usuario."]})


class SubscriptionSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()
    premium_until = serializers.DateTimeField(allow_null=True)
    
    
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username", "email", "is_premium", "premium_until")
    
    

