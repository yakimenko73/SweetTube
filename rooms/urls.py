from django.urls import path
from .views import RoomsView, RoomView


urlpatterns = [
	path(r'rooms/', RoomsView.as_view()),
	path(r'rooms/<slug:code>/', RoomView.as_view()),
]