from django.urls import path
from .views import RoomsView, RoomView, room_not_found, room


urlpatterns = [
	path(r'rooms/', RoomsView.as_view()),
	path(r'rooms/<str:room_name>/', RoomView.as_view()),
	path(r'rooms/<str:room_name>/watch/', room, name="room"),
	path(r'rooms/<str:room_name>/room-not-found/', room_not_found, name="room-not-found"),
]