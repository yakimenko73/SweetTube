from django.urls import path
from .views import index, room, UserAPIView


urlpatterns = [
	path(r'rooms/', index),
	path(r'rooms/<slug:code>/', room),
	path(r'api/create-user/', UserAPIView.as_view()),
]