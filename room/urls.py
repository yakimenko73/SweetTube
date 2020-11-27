from django.urls import path
from .views import RoomView, RoomCreate, create


urlpatterns = [
	path('api/list/', RoomView.as_view()),
	path('api/create/', RoomCreate.as_view()),
	path('create/', create),
]