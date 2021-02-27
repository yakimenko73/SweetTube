from django.urls import path
from .views import CreateRoomAPIView, UpdateRoomAPIView, Create, ListRoomAPIView


urlpatterns = [
    path(r'create/', Create.as_view()),
    path(r'api/room/', CreateRoomAPIView.as_view()),
    path(r'api/rooms/', ListRoomAPIView.as_view()),
    path(r'api/rooms/<int:pk>/', UpdateRoomAPIView.as_view()),
]