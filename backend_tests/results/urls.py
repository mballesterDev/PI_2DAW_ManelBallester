from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('testresults/', views.save_test_result, name='save_test_result'),
    path('testresults/best/', views.best_results, name='best_results'),
    path('testresults/best/model/', views.best_result_by_model, name='best_result_by_model'),
    path('accounts/session/', session_status),
    path('average_score_by_part/', average_score_by_part, name='average_score_by_part'),
    path('average_score_by_section/', average_score_by_section, name='average_score_by_section'),
]
