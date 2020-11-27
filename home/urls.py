from django.urls import path
from .views import index, privacy, contact, terms_of_service


urlpatterns = [
	path('', index, name='index'),
	path('privacy/', privacy, name='privacy'),
	path('tom/', terms_of_service, name='tom'),
	path('contact/', contact, name='contact'),
]