import json
import re

from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
	search_sessionid = re.compile("sessionid=\w+")
	async def connect(self, sessions={}):
		self.session_key = re.findall(self.search_sessionid, str(self.scope["headers"]))[0].replace("sessionid=", "")
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'chat_{self.room_name}'

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

		await self.accept()

		try:
			sessions[self.room_name].append(self.session_key)
		except KeyError:
			sessions[self.room_name] = [self.session_key, ]

		number_users = self.number_users_in_room(sessions)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_visitors',
				'value': number_users,
				'isIncrement': False
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
		sessions = self.connect.__defaults__[0][self.room_name]
		sessions.remove(self.session_key)
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_visitors',
				'value': -1,
				'isIncrement': True
			}
		)
		
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
		value = event['value']
		is_increment = event["isIncrement"]

		await self.send(text_data=json.dumps({
			'type': "visitors",
			'value': value,
			'isIncrement': is_increment
		}))

	def number_users_in_room(self, sessions):
		number_users = len(sessions[self.room_name])
		return number_users