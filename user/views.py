import requests

from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View

from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import SessionAuthentication, BasicAuthentication 

from .serializers import UserSerializer

from .models import User


class CreateUserAPIView(APIView):
	serializer_class = UserSerializer
	renderer_classes = [JSONRenderer, ]

	def get(self, request, format=None):
		request.headers = request.session.get("head_data", {})
		request.data.update(request.session.get("post_data", {}))

		response = self.post(request)

		return redirect(f"http://127.0.0.1:8000/rooms/{request.data['room_name']}/")

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			session_key = request.headers['X-CSRFToken']

			user_status = serializer.data.get('user_status')
			room_id = serializer.data.get('room')
			
			user = User(session_key=session_key, 
				user_status=user_status,
				room_id=room_id,
			)
			user.save()
			return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

		return Response({'Bad request': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)


class UserAPIView(RetrieveUpdateDestroyAPIView):
	def get_object(self, pk):
		return get_object_or_404(User, pk=pk)

	def get(self, request, pk, format=None):
		user = self.get_object(pk)
		serializer = UserSerializer(user)
		return Response(serializer.data)

	def put(self, request, pk, format=None):
		user = self.get_object(pk)
		serializer = UserSerializer(user)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response({'Bad request': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

	def delete(self, request, pk, format=None):
		user = self.get_object(pk)
		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class ListUserAPIView(ListAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer