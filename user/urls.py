from django.urls import path

from .views import CreateUserAPIView, ListUserAPIView, UpdateUserAPIView


urlpatterns = [
	path(r'api/user/', CreateUserAPIView.as_view()),
	path(r'api/users/', ListUserAPIView.as_view()),
    path(r'api/users/<int:pk>/', UpdateUserAPIView.as_view()),
]