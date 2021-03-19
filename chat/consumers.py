import json
import re
import redis

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

from room.models import Room
from youtubeAPI.models import Playlist, Video
from user.models import User, Session
from user.serializers import UserSerializer, SessionSerializer, UserSessionSerializer


class ChatConsumer(AsyncWebsocketConsumer):
	r = redis.Redis()
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_id = await self.get_room_id()
		self.room_group_name = f'chat_{self.room_name}'
		self.session_key = self.scope["cookies"]["sessionid"]
		self.user_nickname = await self.get_user_nickname()
		self.color_user_in_list = await self.define_user_color_in_list()

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

		self.user_counter = self.r.hincrby("user_counters", self.room_name, 1)
		self.r.hmset(f"visitors_{self.room_name}", {
			self.session_key: str({
				"sessionid": self.session_key,
				"user_nickname": self.user_nickname,
				"color_user_in_list": self.color_user_in_list
			})
		})

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'update_user_counter',
				'value': self.user_counter,
				'flag': "join"
			}
		)

		# await self.channel_layer.group_send(
		# 	self.room_group_name,
		# 	{
		# 		'type': 'system_message',
		# 		'message': f"{self.user_nickname} joined the room"
		# 	}
		# )

		list_sessions = self.r.hvals(f"visitors_{self.room_name}")
		for session in list_sessions:
			session_dict = eval(session)
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'update_user_list',
					'userId': session_dict["sessionid"],
					'userNickname': session_dict["user_nickname"],
					'userColor': session_dict["color_user_in_list"],
					'isAdd': 1
				}
			)

		list_messages = self.r.lrange(f"messages_{self.room_name}", 0, -1)
		for message in list_messages:
			message_dict = eval(message)
			await self.send(text_data=json.dumps({
				'type': "chat_message",
				'author': message_dict["author"],
				'color': message_dict["color"],
				'message': message_dict["message"],
			}))

		list_videos = self.r.lrange(f"videos_{self.room_name}", 0, -1)
		for video in list_videos:
			video_dict = eval(video)
			await self.send(text_data=json.dumps({
				'type': "new_video",
				'userNickname': video_dict["userNickname"],
				'videoURL':  video_dict["videoURL"],
				'videoPreviewURL':  video_dict["videoPreviewURL"],
				'videoTitle':  video_dict["videoTitle"],
			}))

	async def disconnect(self, close_code):
		self.user_counter = self.r.hincrby("user_counters", self.room_name, -1)
		self.r.hdel(f"visitors_{self.room_name}", self.session_key)
		
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'update_user_counter',
				'value': self.user_counter,
				'flag': "left"
			}
		)

		# await self.channel_layer.group_send(
		# 	self.room_group_name,
		# 	{
		# 		'type': 'system_message',
		# 		'message': f"{self.user_nickname} left the room"
		# 	}
		# )

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'update_user_list',
				'userId': self.session_key,
				'userNickname': self.user_nickname,
				'userColor': self.color_user_in_list,
				'isAdd': 0
			}
		)
		
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
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
			self.r.rpush(f"videos_{self.room_name}", str({
					"userNickname": user_nickname,
					"videoURL": video_url,
					"videoPreviewURL": video_preview_url,
					"videoTitle": video_title
				}))
		elif message_type == "pause_video":
			await self.channel_layer.group_send(
				self.room_group_name,
				{'type': message_type, }
			)
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
				self.r.rpush(f"messages_{self.room_name}", str({
					"author": author,
					"color": color,
					"message": message
				}))

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
			'flag': event["flag"]
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
	
	async def pause_video(self, event):
		''' Sends a command to pause the video '''
		await self.send(text_data=json.dumps({
			'type': "pause_video"
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