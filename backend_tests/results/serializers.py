from rest_framework import serializers
from .models import TestResult

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = '__all__'

class BestScoreSerializer(serializers.Serializer):
    model_name = serializers.CharField()
    best_score = serializers.IntegerField()
