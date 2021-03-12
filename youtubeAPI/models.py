from django.db import models

from room.models import Room
from user.models import User


class Playlist(models.Model):
	room = models.ForeignKey(Room, verbose_name=("room_id"), on_delete=models.CASCADE)


class Video(models.Model):
	video = models.CharField(max_length=50)

	playlist = models.ForeignKey(Playlist, verbose_name=("playlist_id"), on_delete=models.CASCADE)
	user = models.ForeignKey(User, verbose_name=("user_id"), on_delete=models.CASCADE)