import string
import random

from django.db import models


def generate_unique_code():
	lenght = 6

	while True:
		code = ''.join(random.choices(string.ascii_uppercase, k=lenght))
		if Room.objects.filter(code=code).count() == 0:
			break
	return code		


class Room(models.Model):
	""" Модель описания комнаты """
	code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)

	host = models.CharField(max_length=50, unique=True)

	moder_can_add = models.BooleanField(null=False, default=False)
	moder_can_remove = models.BooleanField(null=False, default=False)
	moder_can_move = models.BooleanField(null=False, default=False)
	moder_can_playpause = models.BooleanField(null=False, default=False)
	moder_can_seek = models.BooleanField(null=False, default=False)
	moder_can_skip = models.BooleanField(null=False, default=False)
	moder_can_use_chat = models.BooleanField(null=False, default=False)
	moder_can_kick = models.BooleanField(null=False, default=False)

	guest_can_add = models.BooleanField(null=False, default=False)
	guest_can_remove = models.BooleanField(null=False, default=False)
	guest_can_move = models.BooleanField(null=False, default=False)
	guest_can_playpause = models.BooleanField(null=False, default=False)
	guest_can_seek = models.BooleanField(null=False, default=False)
	guest_can_skip = models.BooleanField(null=False, default=False)
	guest_can_use_chat = models.BooleanField(null=False, default=False)
	guest_can_kick = models.BooleanField(null=False, default=False)

	def __str__(self):
		return f"host: {self.host}, room-code: {self.code}"


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
	session_key = models.CharField(max_length=40, default=None, unique=True)
	user_status = models.CharField(max_length=2, 
		choices=USER_STATUS_CHOICES, 
		default=GUEST)