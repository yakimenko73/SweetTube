import requests

from django.shortcuts import render
from django.http import HttpResponse

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


class UserAPIView(APIView):
	serializer_class = UserSerializer
	renderer_classes = [JSONRenderer]

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			session_key = request.headers['X-CSRFToken']

			# loading values from the model
			user_status = serializer.data.get('user_status')
			
			queryset = User.objects.filter(session_key=session_key)
			# in case such host already exists
			if queryset.exists():
				user = queryset[0]
				user.user_status = user_status
				
				user.save(update_fields=['user_status'])
				return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
			else:
				user = User(session_key=session_key, 
							user_status=user_status)
				user.save()
				return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

		return Response({'Bad request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class SingleUserAPIView(RetrieveUpdateDestroyAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

def room(request, code):
	if not request.session.session_key:
		request.session.create()
	session_key = request.session.session_key

	# make a post request to the api to add/edit a user
	head_data = {'X-CSRFToken': session_key}
	post_data = {'user_status': 'GU'}

	response = requests.post("http://127.0.0.1:8000/api/create-user/", data=post_data, headers=head_data)

	serializer_class = RoomSettingsSerializer
	queryset = Room.objects.filter(code=code)

	if queryset.exists():
		room = queryset[0]
		data = RoomSerializer(room).data

		return HttpResponse(f"{data}\nUSER: {session_key}", status=status.HTTP_200_OK)

	return render(request, 'rooms/roomnfound.html', {
		'error_message': status.HTTP_400_BAD_REQUEST,
	})