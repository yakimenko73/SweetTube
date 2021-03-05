import json
import re

from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
	search_sessionid = re.compile("sessionid=\w+")
	async def connect(self, sessions=[]):
		self.session_key = re.findall(self.search_sessionid, str(self.scope["headers"]))[0].replace("sessionid=", "")
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'chat_{self.room_name}'

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		
		await self.accept()

		sessions.append([self.room_name, self.session_key])
		unique_sessions = set([str(session) for session in sessions])
		user_counter = 0
		for session in unique_sessions:
			if session.startswith(f"['{self.room_name}'"):
				user_counter += 1

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_visitors',
				'number_visitors': user_counter
			}
		)

		# upload saved messages to WebSocket
		if self.receive.__defaults__[0]:
			for message in self.receive.__defaults__[0]:
				if message[0] == self.room_name:
					await self.send(text_data=json.dumps({
						'message': message[1],
						'author': message[2]
					}))

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data, messages=[]):
		''' Receive message from WebSocket '''
		text_data_json = json.loads(text_data)
		message = text_data_json['message']
		author = text_data_json['author']
		
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_message',
				'message': message,
				'author': author,
			}
		)

		messages.append([self.room_name, message, author])

	async def chat_message(self, event):
		''' Receive message from room group '''
		message = event['message']
		author = event['author']

		await self.send(text_data=json.dumps({
			'message': message, 
			'author': author
		}))

	async def chat_visitors(self, event):
		''' Receive number visitors from room group '''
		number_visitors = event['number_visitors']

		await self.send(text_data=json.dumps({
			'type': "visitors",
			'number_visitors': number_visitors
		}))