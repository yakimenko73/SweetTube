import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Message
from room.models import Room
from room.serializers import RoomSerializer


class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'chat_{self.room_name}'

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

		await self.accept()

		for message in self.receive.__defaults__:
			await self.send(text_data=json.dumps({
				'message': message
			}))

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data, messages=[]):
		''' Receive message from WebSocket '''
		text_data_json = json.loads(text_data)
		content = text_data_json['message']
		author = text_data_json['author']
		room_name = text_data_json['room_name']

		messages.append(content)

		# Send message to room group
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_message',
				'message': content
			}
		)

	async def chat_message(self, event):
		''' Receive message from room group '''
		content = event['message']

		await self.send(text_data=json.dumps({
			'message': content
		}))