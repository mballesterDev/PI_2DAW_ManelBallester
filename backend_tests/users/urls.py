from django.urls import path
from .views import (
    check_email,
    get_subscription,
    UserProfileView,
    
    
)

urlpatterns = [
    path('check_email/', check_email, name='check_email'),
    path('user/subscription/', get_subscription, name='get-subscription'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    
  

    
]
