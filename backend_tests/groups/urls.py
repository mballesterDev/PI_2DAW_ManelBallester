from django.urls import path
from .views import group_scores, groups_list_create, add_user_to_group

urlpatterns = [
    path('groups/', groups_list_create, name='groups-list-create'),
    path('groups/<int:group_id>/scores/', group_scores, name='group-scores'),
    path('groups/<int:group_id>/add-user/', add_user_to_group, name='group-add-user'),
]
