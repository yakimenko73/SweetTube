from django.db import models

from room.models import Room


class User(models.Model):
	""" Модель пользователя """
	HOST = 'HO'
	MODERATOR = 'MO'
	GUEST = 'GU'

	USER_STATUS_CHOICES = (
		(HOST, 'Host'),
		(MODERATOR, 'Moderator'),
		(GUEST, 'Guest'),
	)
	session_key = models.CharField(max_length=40, default=None)
	user_status = models.CharField(max_length=2, 
		choices=USER_STATUS_CHOICES, 
		default=GUEST)
	room = models.ForeignKey(Room, on_delete=models.CASCADE)