import random
import json

from django.db import models
from room.models import Room


def get_default_userdata():
	with open("user/default_userdata.json", "r") as f:
		data = json.load(f)
	return data
	

global default_usernames, default_user_color
default_usernames = get_default_userdata()["defaultNames"]
default_user_color = get_default_userdata()["defaultColors"]


def generate_user_nickname():
	nickname = random.choice(default_usernames)
	return nickname


def generate_user_color():
	color = random.choice(list(default_user_color.values()))
	return color


class Session(models.Model):
	session_key = models.CharField(max_length=40, default=None, unique=True)


class User(models.Model):
	HOST = 'HO'
	MODERATOR = 'MO'
	GUEST = 'GU'

	USER_STATUS_CHOICES = (
		(HOST, 'Host'),
		(MODERATOR, 'Moderator'),
		(GUEST, 'Guest'),
	)

	user_status = models.CharField(max_length=2, 
		choices=USER_STATUS_CHOICES, 
		default=GUEST)

	user_nickname = models.CharField(max_length=40, default=generate_user_nickname)
	user_color = models.CharField(max_length=40, default=generate_user_color)
	room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='user_room')
	session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='user_session')