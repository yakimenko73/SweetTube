import requests
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

from .serializers import RoomSerializer, RoomSettingsSerializer, UserSerializer
from .models import Room, User


class RoomsAPIView(APIView):
	serializer_class = RoomSettingsSerializer
	renderer_classes = [JSONRenderer]

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			host = request.headers['X-CSRFToken']

			# loading values from the request
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
			# in case such host already exists
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

		return Response({'Bad request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class SingleRoomAPIView(RetrieveUpdateDestroyAPIView):
	queryset = Room.objects.all()
	serializer_class = RoomSerializer


class Create(View):
	def get(self, request, format=None):
		request.session.create()
		session_key = request.session.session_key

		self.take_room(session_key)

		queryset = Room.objects.filter(host=session_key)

		if queryset.exists():
			room = queryset[0]

			data = RoomSerializer(room).data

			return redirect(f"http://127.0.0.1:8000/rooms/{data['code']}")

		return HttpResponse('Something went wrong :(', status=status.HTTP_400_BAD_REQUEST)

	def take_room(self, session_key):
		""" 
			function make a post request to the api to add/edit a user 
		"""
		head_data = {"X-CSRFToken": session_key}
		post_data = {
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
			"guest_can_kick": True
		}

		requests.post('http://127.0.0.1:8000/api/create-room/', data=post_data, headers=head_data)