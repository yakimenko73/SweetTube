from django.urls import path
from .views import index, privacy, contact, terms_of_service


urlpatterns = [
	path(r'', index, name='index'),
	path(r'privacy/', privacy, name='privacy'),
	path(r'tos/', terms_of_service, name='tos'),
	path(r'contact/', contact, name='contact'),
]