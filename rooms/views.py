from django.shortcuts import render
from django.http import HttpResponse

from rest_framework import status

from room.serializers import RoomSerializer, RoomSettingsSerializer
from room.models import Room


def index(request):
	return HttpResponse('Rooms will be displayed.')


def room(request, code):
	serializer_class = RoomSettingsSerializer
	queryset = Room.objects.filter(code=code)

	if queryset.exists():
		room = queryset[0]
		data = RoomSerializer(room).data

		return HttpResponse(f"{data}\nSESSION_KEY={request.session.session_key}", status=status.HTTP_200_OK)

	return render(request, 'rooms/roomnfound.html', {
		'error_message': status.HTTP_400_BAD_REQUEST,
	})