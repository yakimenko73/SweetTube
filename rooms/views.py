import requests

from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.views.generic import View

from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.generics import RetrieveDestroyAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from room.serializers import RoomSerializer, RoomSettingsSerializer
from user.serializers import UserSerializer, UserSessionSerializer, SessionSerializer

from room.models import Room
from user.models import User, Session


class ListRoomView(View):
	def get(self, request, format=None):
		response = requests.get("http://127.0.0.1:8000/api/rooms/")	
		return HttpResponse(f"{response.json()}")


class RoomView(View):
	def get(self, request, room_name, format=None):
		roomset = Room.objects.filter(code=room_name)
		if roomset.exists():
			room = roomset[0]
			room_data = RoomSerializer(room).data
		else:
			return self.room_not_found_render(request, room_name)

		if not request.session.session_key:
			request.session.create()
			return self.create_guest_user(request, room_name, room_data["id"])
		
		userset = User.objects.filter(room=room_data["id"])
		current_session_key = request.session.session_key
		session_keys = self.get_session_keys(userset)

		if current_session_key in session_keys:
			for index, session in enumerate(session_keys):
				if current_session_key == session:
					user_data = UserSerializer(userset[index]).data
					return self.room_render(request, room_data, user_data)
		else:
			return self.create_guest_user(request, room_name, room_data["id"])

	def post(self, request, room_name, format=None):
		if request.body.decode("utf-8") == "alreadyInTheRoom":
			data = {'count': 1}
			return self.already_in_the_room_render(request, room_name)

	def create_guest_user(self, request, room_name, room_id):
		request.session["head_data"] = {"X-CSRFToken": request.session.session_key}
		request.session["post_data"] ={'user_status': "GU",
			'room': room_id,
			'room_name': room_name,
		}
		return redirect(f"http://127.0.0.1:8000/api/user/")

	def get_session_keys(self, userset):
		session_keys = []
		for index, user in enumerate(userset):
			user_data = UserSerializer(user).data
			user_sessionid = UserSessionSerializer(user).data["session"]
			session_session_key = Session.objects.filter(id=user_sessionid)[0].session_key
			session_keys.append(session_session_key)

		return session_keys
			
	def room_not_found_render(self, request, room_name):
		return render(request, 'rooms/roomnfound.html', {
			'room_name': room_name,
			'error_message': status.HTTP_404_NOT_FOUND,
		})

	def already_in_the_room_render(self, request, room_name):
		return render(request, 'rooms/already_in_the_room.html', {
			'room_name': room_name,
			'error_message': status.HTTP_200_OK,
		})

	def room_render(self, request, room_data, user_data):
		return render(request, 'rooms/index.html', {
			'room_name': room_data["code"],
			'room_id': room_data["id"],
			'user_nickname': user_data["user_nickname"],
			'user_session_key': request.session.session_key,
			'user_color': user_data["user_color"],
			'error_message': status.HTTP_200_OK,
		})