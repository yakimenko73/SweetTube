from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics

from .serializers import RoomSerializer
from .models import Room


class RoomView(generics.ListAPIView):
	""" Класс представления страницы создания комнаты """
	queryset = Room.objects.all()
	serializer_class = RoomSerializer


class RoomCreate(generics.CreateAPIView):
	""" Класс представления страницы создания команты """
	queryset = Room.objects.all()
	serializer_class = RoomSerializer

def create(request):
	return HttpResponse('Room created. Redicrect to rooms/id')