from django.urls import path
from .views import index, room


urlpatterns = [
	path('rooms/', index),
	path(r'rooms/<slug:code>/', room),
]