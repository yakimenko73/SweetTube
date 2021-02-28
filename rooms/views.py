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
	def get(self, request, room_name, format=None):
		if not request.session.session_key:
			request.session["followed_the_link"] = {"followed_the_link": True,
				"room_name": room_name,
			}
			return redirect("http://127.0.0.1:8000/create/")

		if request.session.get("room_not_found", None):
			request.session.pop("room_not_found", None)
			return self.room_not_found_render(request, room_name)
		else:
			return self.room_render(request, room_name)

	def room_not_found_render(self, request, room_name):
		return render(request, 'rooms/roomnfound.html', {
			'room_name': room_name,
			'error_message': status.HTTP_404_NOT_FOUND,
		})


	def room_render(self, request, room_name):
		return render(request, 'rooms/index.html', {
			'room_name': room_name,
			'error_message': status.HTTP_200_OK,
		})