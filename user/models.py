import random
import json

from django.db import models
from room.models import Room


def get_default_usernames():
	with open("user/usernames.json", "r") as f:
		names = json.load(f)
	return names["defaultNames"]
	
global default_usernames
default_usernames = get_default_usernames()

def generate_user_nickname():
	nickname = random.choice(default_usernames)
	return nickname


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
	user_nickname = models.CharField(max_length=40, default=generate_user_nickname)
	room = models.ForeignKey(Room, on_delete=models.CASCADE)