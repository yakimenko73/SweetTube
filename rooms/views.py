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

from room.serializers import RoomSerializer, RoomSettingsSerializer, UserSerializer
from room.models import Room, User


def index(request):
	return HttpResponse('Rooms will be displayed.')


class UsersAPIView(APIView):
	serializer_class = UserSerializer
	renderer_classes = [JSONRenderer]

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			session_key = request.headers['X-CSRFToken']

			# loading values from the request
			user_status = serializer.data.get('user_status')
			room_id = serializer.data.get('room')
			
			queryset = User.objects.filter(session_key=session_key)
			# in case such host already exists
			if queryset.exists():
				user = queryset[0]
				user.user_status = user_status
				user.room_id = room_id
				
				user.save(update_fields=['user_status', 'room_id'])
				return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
			else:
				user = User(session_key=session_key, 
							user_status=user_status,
							room_id=room_id)
				user.save()
				return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

		return Response({'Bad request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class SingleUserAPIView(RetrieveUpdateDestroyAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer


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
			self.take_user(session_key, user_status, room_data['id'])		

			return HttpResponse(f"{room_data}\nUSER: {session_key}", status=status.HTTP_200_OK)

		return render(request, 'rooms/roomnfound.html', {
			'error_message': status.HTTP_400_BAD_REQUEST,
		})
	
	def take_user(self, session_key, user_status, room_id):
		""" 
			function make a post request to the api to add/edit a user 
		"""
		head_data = {'X-CSRFToken': session_key}
		post_data = {'user_status': user_status,
			'room': room_id,
		}

		requests.post("http://127.0.0.1:8000/api/create-user/", data=post_data, headers=head_data)