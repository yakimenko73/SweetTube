import json
import re
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

from room.models import Room
from youtubeAPI.models import Playlist, Video
from user.models import User, Session
from user.serializers import UserSerializer, SessionSerializer, UserSessionSerializer


class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self, sessions={}):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_id = await self.get_room_id()
		self.room_group_name = f'chat_{self.room_name}'
		self.session_key = self.scope["cookies"]["sessionid"]
		self.user_nickname = await self.get_user_nickname()
		self.color_user_in_list = await self.define_user_color_in_list()
		self.user_data = [self.session_key, 
			self.user_nickname, 
			self.color_user_in_list, 
		]

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

		try:
			sessions[self.room_name].append(self.user_data)
		except KeyError as ex:
			sessions[self.room_name] = [self.user_data, ]

		number_users = self.number_users_in_room(sessions)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'update_user_counter',
				'value': number_users,
				'isIncrement': False
			}
		)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'system_message',
				'message': f"{self.user_nickname} joined the room"
			}
		)

		for session in sessions[self.room_name]:
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'update_user_list',
					'userId': session[0],
					'userNickname': session[1],
					'userColor': session[2],
					'isAdd': 1
				}
			)

		# upload saved data to WebSocket
		if self.receive.__defaults__[0]: # messages
			for message in self.receive.__defaults__[0]:
				if message[0] == self.room_name:
					await self.send(text_data=json.dumps({
						'type': "chat_message",
						'message': message[1],
						'author': message[2],
						'color': message[3],
					}))

		if self.receive.__defaults__[1]: # videos
			for video in self.receive.__defaults__[1]:
				if video[0] == self.room_name:
					await self.send(text_data=json.dumps({
						'type': "new_video",
						'userNickname':  video[1],
						'videoURL':  video[2],
						'videoPreviewURL':  video[3],
						'videoTitle':  video[4],
					}))

	async def disconnect(self, close_code):
		sessions = self.connect.__defaults__[0][self.room_name]
		sessions.remove(self.user_data)

		# sending a new users counter state
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_visitors',
				'value': -1,
				'isIncrement': True
			}
		)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'system_message',
				'message': f"{self.user_nickname} left the room"
			}
		)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'update_user_list',
				'userNickname': self.user_nickname,
				'userId': self.session_key,
				'userColor': self.color_user_in_list,
				'isAdd': 0
			}
		)
		
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data, messages=[], videos=[]):
		''' Receive message from WebSocket '''
		text_data_json = json.loads(text_data)
		message_type = text_data_json["type"]

		if message_type == "new_video":
			user_nickname = text_data_json['userNickname']
			video_url = text_data_json['videoURL']
			video_preview_url = text_data_json['videoPreviewURL']
			video_title = text_data_json['videoTitle']
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': message_type,
					'userNickname': user_nickname,
					'videoURL': video_url,
					'videoPreviewURL': video_preview_url,
					'videoTitle': video_title,
				}
			)
			videos.append([self.room_name, 
				user_nickname, video_url, 
				video_preview_url, video_title
			])
		else:
			message = text_data_json['message']
			author = text_data_json['author']
			color = text_data_json['color']
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': message_type,
					'message': message,
					'author': author,
					'color': color,
				}
			)

			if message_type != "system_message":
				messages.append([self.room_name, message, author, color])

	async def chat_message(self, event):
		''' Receive message from room group '''
		await self.send(text_data=json.dumps({
			'type': event["type"],
			'message': event['message'],
			'author': event['author'],
			'color': event['color']
		}))

	async def update_user_counter(self, event):
		''' Receive number visitors from room group '''
		await self.send(text_data=json.dumps({
			'type': "update_user_counter",
			'value': event['value'],
			'isIncrement': event["isIncrement"]
		}))

	async def system_message(self, event):
		''' Receive system messages from room group '''
		await self.send(text_data=json.dumps({
			'type': "system_message",
			'message': event['message']
		}))

	async def new_video(self, event):
		''' Receive video info from room group '''
		await self.send(text_data=json.dumps({
			'type': "new_video",
			'userNickname': event['userNickname'],
			'videoURL': event['videoURL'],
			'videoPreviewURL': event['videoPreviewURL'],
			'videoTitle': event['videoTitle']
		}))

	async def update_user_list(self, event):
		''' Receive a message about updating the list of users from room group '''
		await self.send(text_data=json.dumps({
			'type': "update_user_list",
			'userNickname': event['userNickname'],
			'userId': event['userId'],
			'userColor': event['userColor'],
			'isAdd': event["isAdd"]
		}))

	def number_users_in_room(self, sessions):
		number_users = len(sessions[self.room_name])
		return number_users

	@database_sync_to_async
	def get_room_id(self):
		return Room.objects.get(code=self.room_name).id

	@database_sync_to_async
	def get_user_nickname(self):
		session_id = Session.objects.get(session_key=self.session_key).id
		user_nickname = User.objects.get(session=session_id, room=self.room_id).user_nickname
		return user_nickname

	@database_sync_to_async
	def define_user_color_in_list(self):
		session_id = Session.objects.get(session_key=self.session_key).id
		user_status = User.objects.get(session=session_id, room=self.room_id).user_status
		
		if user_status == "HO":
			user_color = "#4b0b0b"
		elif user_status == "MO":
			user_color = "#503704"
		else:
			user_color = "#383838"

		return user_color