from django.urls import path

from .views import CreateUserAPIView, ListUserAPIView, UserAPIView


urlpatterns = [
	path(r'api/user/', CreateUserAPIView.as_view()),
	path(r'api/users/', ListUserAPIView.as_view()),
    path(r'api/users/<int:pk>/', UserAPIView.as_view()),
]