import requests
from django.http import HttpResponse
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.generics import DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import RoomSerializer, RoomSettingsSerializer
from .models import Room


class RoomsAPIView(APIView):
	serializer_class = RoomSettingsSerializer

	def post(self, request, format=None):
		if not self.request.session.exists(self.request.session.session_key):
			self.request.session.create()

		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			# подгрузка значений из модели
			host = self.request.session.session_key

			moder_can_add = serializer.data.get('moder_can_add')
			moder_can_remove = serializer.data.get('moder_can_remove')
			moder_can_move = serializer.data.get('moder_can_move')
			moder_can_playpause = serializer.data.get('moder_can_playpause')
			moder_can_seek = serializer.data.get('moder_can_seek')
			moder_can_skip = serializer.data.get('moder_can_skip')
			moder_can_use_chat = serializer.data.get('moder_can_use_chat')
			moder_can_kick = serializer.data.get('moder_can_kick')

			quest_can_add = serializer.data.get('quest_can_add')
			quest_can_remove = serializer.data.get('quest_can_remove')
			quest_can_move = serializer.data.get('quest_can_move')
			quest_can_playpause = serializer.data.get('quest_can_playpause')
			quest_can_seek = serializer.data.get('quest_can_seek')
			quest_can_skip = serializer.data.get('quest_can_skip')
			quest_can_use_chat = serializer.data.get('quest_can_use_chat')
			quest_can_kick = serializer.data.get('quest_can_kick')

			queryset = Room.objects.filter(host=host)
			# случай если такой host уже есть
			if queryset.exists():
				room = queryset[0]
				room.moder_can_add = moder_can_add
				room.moder_can_remove = moder_can_remove
				room.moder_can_move = moder_can_move
				room.moder_can_playpause = moder_can_playpause
				room.moder_can_seek = moder_can_seek
				room.moder_can_skip = moder_can_skip
				room.moder_can_use_chat = moder_can_use_chat
				room.moder_can_kick = moder_can_kick

				room.quest_can_add = quest_can_add
				room.quest_can_remove = quest_can_remove
				room.quest_can_move = quest_can_move
				room.quest_can_playpause = quest_can_playpause
				room.quest_can_seek = quest_can_seek
				room.quest_can_skip = quest_can_skip
				room.quest_can_use_chat = quest_can_use_chat
				room.quest_can_kick = quest_can_kick

				room.save(update_fields=['moder_can_add', 'moder_can_remove', 'moder_can_move',
									'moder_can_playpause', 'moder_can_seek', 'moder_can_skip',
									'moder_can_use_chat', 'moder_can_kick', 'quest_can_add',
									'quest_can_remove', 'quest_can_move', 'quest_can_playpause',
									'quest_can_seek', 'quest_can_skip', 'quest_can_use_chat', 
									'quest_can_kick'])
				return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
			else:
				room = Room(host=host, 
							moder_can_add=moder_can_add, 
							moder_can_remove=moder_can_remove,
							moder_can_move=moder_can_move, 
							moder_can_playpause=moder_can_playpause,
							moder_can_seek=moder_can_seek,
							moder_can_skip=moder_can_skip,
							moder_can_use_chat=moder_can_use_chat,
							moder_can_kick=moder_can_kick, 
							quest_can_add=quest_can_add, 
							quest_can_remove=quest_can_remove, 
							quest_can_move=quest_can_move, 
							quest_can_playpause=quest_can_playpause, 
							quest_can_seek=quest_can_seek, 
							quest_can_skip=quest_can_skip, 
							quest_can_use_chat=quest_can_kick, 
							quest_can_kick=quest_can_kick)
				room.save()
				return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

		return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class SingleRoomAPIView(DestroyAPIView):
	queryset = Room.objects.all()
	serializer_class = RoomSerializer


def create(request):
	response = requests.post('http://127.0.0.1:8000/create/api/')
	print(response)
	return Response(response)