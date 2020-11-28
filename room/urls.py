from django.urls import path
from .views import RoomsAPIView, SingleRoomAPIView, create


urlpatterns = [
	path('api/rooms', RoomsAPIView.as_view()),
    path('api/rooms/<int:pk>/', SingleRoomAPIView.as_view()),
    path('create/', RoomsAPIView.as_view()),
]