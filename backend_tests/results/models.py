from django.conf import settings
from django.db import models
from groups.models import Group  # aquí importes el model Group de l'app groups

class TestResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True, related_name='test_results')
    level = models.CharField(max_length=50)
    section = models.CharField(max_length=100)
    part = models.IntegerField()
    model_name = models.CharField(max_length=50)
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'level', 'section', 'part', 'model_name')

    def __str__(self):
        return f"{self.user} - {self.model_name} ({self.score} pts)"
