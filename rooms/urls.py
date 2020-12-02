from django.urls import path
from .views import index, room


urlpatterns = [
	path(r'rooms/', index),
	path(r'rooms/<slug:code>/', room)
]