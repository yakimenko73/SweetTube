import json

from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'chat_{self.room_name}'

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

		await self.accept()

		if self.receive.__defaults__[0]:
			for message in self.receive.__defaults__[0]:
				if message[0] == self.room_name:
					await self.send(text_data=json.dumps({
						'message': message[1]
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
		
		# Send message to room group
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_message',
				'message': message,
			}
		)

		messages.append([self.room_name, message])

	async def chat_message(self, event):
		''' Receive message from room group '''
		message = event['message']

		await self.send(text_data=json.dumps({
			'message': message
		}))