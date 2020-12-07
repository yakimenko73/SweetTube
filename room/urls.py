from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import RoomsAPIView, SingleRoomAPIView, Create


urlpatterns = [
    path(r'api/create-room/', RoomsAPIView.as_view()),
    path(r'api/rooms/<int:pk>/', SingleRoomAPIView.as_view()),
    path(r'create/', Create.as_view()),
]