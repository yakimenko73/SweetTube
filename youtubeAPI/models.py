from django.db import models

from room.models import Room
from user.models import User


class Playlist(models.Model):
	room = models.ForeignKey(Room, verbose_name=("room_id"), on_delete=models.CASCADE)


class Video(models.Model):
	pass