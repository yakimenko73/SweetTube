from django.urls import path
from .views import index, privacy, contact, terms_of_service


urlpatterns = [
	path(r'', index, name='index'),
	path(r'privacy/', privacy, name='privacy'),
	path(r'tom/', terms_of_service, name='tom'),
	path(r'contact/', contact, name='contact'),
]