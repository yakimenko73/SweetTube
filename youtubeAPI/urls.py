from django.urls import path

from .views import CreatePlaylistAPIView


urlpatterns = [
	path(r'api/youtube/playlist/', CreatePlaylistAPIView.as_view()),
]