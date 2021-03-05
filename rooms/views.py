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
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import SessionAuthentication, BasicAuthentication 

from room.serializers import RoomSerializer, RoomSettingsSerializer
from user.serializers import UserSerializer

from room.models import Room
from user.models import User


class RoomsView(View):
	def get(self, request, format=None):
		response = requests.get("http://127.0.0.1:8000/api/rooms/")	
		return HttpResponse(f"{response.json()}")


class RoomView(View):
	def get(self,request, room_name, format=None):
		roomset = Room.objects.filter(code=room_name)
		if roomset.exists():
			room = roomset[0]
			room_data = RoomSerializer(room).data
		else:
			return self.room_not_found_render(request, room_name)

		if not request.session.session_key:
			request.session.create()
			request.session.set_expiry(0)
			return self.create_guest_session(request, room_name, room_data["id"])
		
		userset = User.objects.filter(session_key=request.session.session_key).order_by("room")[:1]
		user_data = UserSerializer(userset[0]).data
		if user_data["room"] == room_data["id"]:
			return self.room_render(request, room_data, user_data)
		else:
			return self.create_guest_session(request, room_name, room_data["id"])


	def create_guest_session(self, request, room_name, room_id):
		request.session["head_data"] = {"X-CSRFToken": request.session.session_key}
		request.session["post_data"] ={'user_status': "GU",
			'room': room_id,
			'room_name': room_name,
		}
		return redirect(f"http://127.0.0.1:8000/api/user/")
			
	def room_not_found_render(self, request, room_name):
		return render(request, 'rooms/roomnfound.html', {
			'room_name': room_name,
			'error_message': status.HTTP_404_NOT_FOUND,
		})

	def already_in_the_room(self, request, room_name):
		return render(request, 'rooms/already_in_the_room.html', {
			'room_name': room_name,
			'error_message': status.HTTP_200_OK,
		})

	def room_render(self, request, room_data, user_data):
		return render(request, 'rooms/index.html', {
			'room_name': room_data["code"],
			'room_id': room_data["id"],
			'user_nickname': user_data["user_nickname"],
			'error_message': status.HTTP_200_OK,
		})