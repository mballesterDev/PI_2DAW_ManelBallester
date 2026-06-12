from rest_framework import serializers
from .models import Exercise

class ExerciseSerializer(serializers.ModelSerializer):
    image1_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()
    image3_url = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = [
            'id', 'level', 'section', 'part', 'model_name',
            'content', 'video', 'explanation', 'transcription',
            'enunciado',
            'image1', 'image2', 'image3',
            'image1_url', 'image2_url', 'image3_url',
        ]

    def get_image1_url(self, obj):
        request = self.context.get('request')
        if obj.image1:
            return request.build_absolute_uri(obj.image1.url) if request else obj.image1.url
        return None

    def get_image2_url(self, obj):
        request = self.context.get('request')
        if obj.image2:
            return request.build_absolute_uri(obj.image2.url) if request else obj.image2.url
        return None

    def get_image3_url(self, obj):
        request = self.context.get('request')
        if obj.image3:
            return request.build_absolute_uri(obj.image3.url) if request else obj.image3.url
        return None
