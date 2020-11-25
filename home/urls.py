from django.urls import path
from .views import index, privacy


urlpatterns = [
	path('', index, name='index'),
	path('privacy/', privacy, name='privacy'),
]