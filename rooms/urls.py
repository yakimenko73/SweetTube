from django.urls import path
from .views import index, RoomView, UsersAPIView


urlpatterns = [
	path(r'rooms/', index),
	path(r'rooms/<slug:code>/', RoomView.as_view()),
	path(r'api/create-user/', UsersAPIView.as_view()),
]