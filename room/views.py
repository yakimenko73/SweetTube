import time

from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from django.middleware import csrf
from django.shortcuts import redirect, render

from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.generics import RetrieveDestroyAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import SessionAuthentication, BasicAuthentication 

from .serializers import RoomSerializer, RoomSettingsSerializer
from user.serializers import UserSerializer

from .models import Room 
from user.models import User


OWNER_RIGHTS = {
			"moder_can_add": True, 
			"moder_can_remove": True,
			"moder_can_move": True, 
			"moder_can_playpause": True,
			"moder_can_seek": True,
			"moder_can_skip": True,
			"moder_can_use_chat": True,
			"moder_can_kick": True, 
			"guest_can_add": True, 
			"guest_can_remove": True, 
			"guest_can_move": True, 
			"guest_can_playpause": True, 
			"guest_can_seek": True, 
			"guest_can_skip": True, 
			"guest_can_use_chat": True, 
			"guest_can_kick": True,
}


class CreateRoomAPIView(APIView):
	serializer_class = RoomSettingsSerializer
	renderer_classes = [JSONRenderer, ]

	def get(self, request, format=None):
		request.headers = request.session.get("head_data", None)
		request.data.update(request.session.get("post_data", None))

		response = self.post(request)

		request.session["head_data"] = request.headers
		request.session["post_data"] ={'user_status': "HO",
			'room': response.data['id'],
			'room_name': response.data['code'],
		}

		return redirect(f"http://127.0.0.1:8000/api/user/")

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			host = request.headers['X-CSRFToken']

			moder_can_add = serializer.data.get('moder_can_add')
			moder_can_remove = serializer.data.get('moder_can_remove')
			moder_can_move = serializer.data.get('moder_can_move')
			moder_can_playpause = serializer.data.get('moder_can_playpause')
			moder_can_seek = serializer.data.get('moder_can_seek')
			moder_can_skip = serializer.data.get('moder_can_skip')
			moder_can_use_chat = serializer.data.get('moder_can_use_chat')
			moder_can_kick = serializer.data.get('moder_can_kick')

			guest_can_add = serializer.data.get('guest_can_add')
			guest_can_remove = serializer.data.get('guest_can_remove')
			guest_can_move = serializer.data.get('guest_can_move')
			guest_can_playpause = serializer.data.get('guest_can_playpause')
			guest_can_seek = serializer.data.get('guest_can_seek')
			guest_can_skip = serializer.data.get('guest_can_skip')
			guest_can_use_chat = serializer.data.get('guest_can_use_chat')
			guest_can_kick = serializer.data.get('guest_can_kick')

			queryset = Room.objects.filter(host=host)
			if queryset.exists():
				room = queryset[0]

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
							guest_can_add=guest_can_add, 
							guest_can_remove=guest_can_remove, 
							guest_can_move=guest_can_move, 
							guest_can_playpause=guest_can_playpause, 
							guest_can_seek=guest_can_seek, 
							guest_can_skip=guest_can_skip, 
							guest_can_use_chat=guest_can_kick, 
							guest_can_kick=guest_can_kick)
				room.save()

				return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

		return Response({'Bad request': 'Invalid data.'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateRoomAPIView(RetrieveUpdateDestroyAPIView):
	queryset = Room.objects.all()
	serializer_class = RoomSerializer


class ListRoomAPIView(ListAPIView):
	queryset = Room.objects.all()
	serializer_class = RoomSerializer


class Create(View):
	def get(self, request, format=None):
		request.session.create()
		request.session.set_expiry(0)
		session_key = request.session.session_key

		request.session["head_data"] = {"X-CSRFToken": session_key}

		request.session["post_data"] = OWNER_RIGHTS
			
		return redirect(f"http://127.0.0.1:8000/api/room/")