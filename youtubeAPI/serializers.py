from rest_framework import serializers

from .models import Playlist, Video

class PlaylistSerializer(serializers.ModelSerializer):
	class Meta:
		model = Playlist
		fields = ('room', )

class VideoSerializer(serializers.ModelSerializer):
	class Meta:
		model = Video
		fields = ('video_url', 'preview_url', 'title', 'playlist', 'user', )