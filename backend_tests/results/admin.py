from django.contrib import admin
from .models import TestResult

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'model_name', 'score', 'level', 'section', 'part', 'created_at')
    list_filter = ('level', 'section', 'part', 'model_name', 'created_at')
    search_fields = ('user__username', 'model_name')
    ordering = ('-created_at',)
