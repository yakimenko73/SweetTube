import requests

from django.shortcuts import render
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


class RoomView(View):
	def get(self, request, code, format=None):
		queryset = Room.objects.filter(code=code)
		if queryset.exists():
			room = queryset[0]
			room_data = RoomSerializer(room).data
			
			# check for activated session
			if not request.session.session_key:
				request.session.create()
			session_key = request.session.session_key

			# request for add or edit user
			user_status = 'HO' if room_data['host'] == session_key else 'GU'
			self.create_user(session_key, user_status, room_data['id'])		

			return render(request, 'rooms/index.html', {
				'room_name': code,
				'error_message': status.HTTP_200_OK,
		})

		return render(request, 'rooms/roomnfound.html', {
			'error_message': status.HTTP_400_BAD_REQUEST,
		})
	
	def create_user(self, session_key, user_status, room_id):
		""" 
			function make a post request to the api to add/edit a user 
		"""
		head_data = {'X-CSRFToken': session_key}
		post_data = {'user_status': user_status,
			'room': room_id,
		}

		requests.post("http://127.0.0.1:8000/api/user/", data=post_data, headers=head_data)


class RoomsView(View):
	def get(self, request, format=None):
		response = requests.get("http://127.0.0.1:8000/api/rooms/")	
		return HttpResponse(f"{response.json()}")