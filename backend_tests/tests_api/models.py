from django.db import models
from django.conf import settings

class Exercise(models.Model):
    LEVEL_CHOICES = [
        ('B2', 'B2'),
        ('C1', 'C1'),
    ]

    SECTION_CHOICES = [
        ('reading', 'Reading'),
        ('use_of_english', 'Use of English'),
        ('listening', 'Listening'),
        ('writing', 'Writing'),
        ('speaking', 'Speaking'),
    ]

    level = models.CharField(max_length=2, choices=LEVEL_CHOICES, default='C1')
    section = models.CharField(max_length=20, choices=SECTION_CHOICES, default='use_of_english')
    part = models.PositiveIntegerField(default=4)
    model_name = models.CharField(max_length=50, default='model')
    content = models.JSONField(default=dict)
    video = models.CharField(max_length=255, default='https://youtu.be/fwBB6Fhj8jQ?si=2IHwIq9i21tCqQfP')
    explanation = models.JSONField(null=True, blank=True, default=dict)
    transcription = models.JSONField(null=True, blank=True, default=dict)
    enunciado = models.CharField(max_length=500, default='', blank=True, null=True)

    # 🖼️ Varias imágenes dentro del mismo modelo
    image1 = models.ImageField(upload_to='exercise_images/', null=True, blank=True)
    image2 = models.ImageField(upload_to='exercise_images/', null=True, blank=True)
    image3 = models.ImageField(upload_to='exercise_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.level} - {self.section} - Part {self.part} - {self.model_name}"

    # 🖼️ Propiedades para obtener las URLs de cada imagen
    @property
    def image1_url(self):
        if self.image1:
            return f"{settings.MEDIA_URL}{self.image1}"
        return None

    @property
    def image2_url(self):
        if self.image2:
            return f"{settings.MEDIA_URL}{self.image2}"
        return None

    @property
    def image3_url(self):
        if self.image3:
            return f"{settings.MEDIA_URL}{self.image3}"
        return None
