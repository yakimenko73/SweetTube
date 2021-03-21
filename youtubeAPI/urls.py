from django.urls import path

from .views import CreatePlaylistAPIView, CreateVideoAPIView


urlpatterns = [
	path(r'api/youtube/playlist/', CreatePlaylistAPIView.as_view()),
	path(r'api/youtube/video/', CreateVideoAPIView.as_view()),
]