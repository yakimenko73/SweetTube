from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import ListRoomView, RoomView


urlpatterns = [
	path(r'rooms/', ListRoomView.as_view()),
	path(r'rooms/<str:room_name>/', csrf_exempt(RoomView.as_view())),
]