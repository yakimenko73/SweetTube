from django.urls import path
from .views import RoomsView, RoomView


urlpatterns = [
	path(r'rooms/', RoomsView.as_view()),
	path(r'rooms/<str:room_name>/', RoomView.as_view()),
]