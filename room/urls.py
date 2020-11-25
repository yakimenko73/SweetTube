from django.urls import path
from .views import RoomView, RoomCreate


urlpatterns = [
	path('api/list/', RoomView.as_view()),
	path('api/create/', RoomCreate.as_view()),
]