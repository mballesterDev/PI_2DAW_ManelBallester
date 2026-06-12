# groups/serializers.py
from rest_framework import serializers
from .models import Group

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'members']
        read_only_fields = ['id', 'owner', 'members']
