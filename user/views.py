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
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from .serializers import UserSerializer, SessionSerializer

from .models import User, Session
from room.models import Room


class CsrfExemptSessionAuthentication(SessionAuthentication):
	def enforce_csrf(self, request):
		return


class CreateUserAPIView(APIView):
	session_serializer_class = SessionSerializer
	user_serializer_class = UserSerializer
	renderer_classes = [JSONRenderer, ]

	def get(self, request, format=None):
		request.headers = request.session.get("head_data", {})
		request.data.update(request.session.get("post_data", {}))

		response = self.post(request)

		return redirect(f"http://127.0.0.1:8000/rooms/{request.data['room_name']}/")

	def post(self, request, format=None):
		session_key = request.headers['X-CSRFToken']
		session_serializer = self.session_serializer_class(data={"session_key": session_key})
		user_serializer = self.user_serializer_class(data=request.data)

		session_queryset = Session.objects.filter(session_key=session_key)
		if not session_queryset.exists():
			if session_serializer.is_valid():
				session = Session(session_key=session_key)
				session.save()
			else:
				return Response({'Bad request': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
		else:
			session = session_queryset[0]
		if user_serializer.is_valid():
			user_status = user_serializer.data.get('user_status')
			room_id = user_serializer.data.get('room')
			user = User(user_status=user_status,
				room=Room.objects.get(id=room_id),
				session=session,
			)
			user.save()
			return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
		else:
			return Response({'Bad request': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)


class UserAPIView(RetrieveUpdateDestroyAPIView):
	authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication, )
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
		print(pk, "DELETE")
		user = self.get_object(pk)
		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class ListUserAPIView(ListAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer