from django.urls import path
from .views import CreateRoomAPIView, UpdateRoomAPIView, Create, ListRoomsAPIView


urlpatterns = [
    path(r'create/', Create.as_view()),
    path(r'api/room/', CreateRoomAPIView.as_view()),
    path(r'api/rooms/', ListRoomsAPIView.as_view()),
    path(r'api/rooms/<int:pk>/', UpdateRoomAPIView.as_view()),
]