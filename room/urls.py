from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import RoomsAPIView, SingleRoomAPIView, create


urlpatterns = [
	path('noncsrf/api/create-room/', csrf_exempt(RoomsAPIView.as_view())),
	path('api/create-room/', RoomsAPIView.as_view()),
    path('api/rooms/<int:pk>/', SingleRoomAPIView.as_view()),
    path('create/', create),
]