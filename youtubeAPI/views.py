import requests

from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.views.generic import View

from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.generics import RetrieveDestroyAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from .serializers import PlaylistSerializer, VideoSerializer

from room.models import Room
from .models import Playlist, Video


class CsrfExemptSessionAuthentication(SessionAuthentication):
	def enforce_csrf(self, request):
		return


class CreatePlaylistAPIView(APIView):
	playlist_serializer_class = PlaylistSerializer
	renderer_classes = [JSONRenderer, ]
	authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication, )
	def post(self, request, format=None):
		room_id = Room.objects.filter(code=request.body.decode("utf-8"))[0].id
		playlist_serializer = self.playlist_serializer_class(data={"room": room_id})

		playlist_queryset = Playlist.objects.filter(room_id=room_id)
		if playlist_serializer.is_valid():
			if not playlist_queryset.exists():
				playlist = Playlist(room_id=room_id)
				playlist.save()
				return Response(PlaylistSerializer(playlist).data, status=status.HTTP_201_CREATED)
			else:
				playlist = playlist_queryset[0]
				return Response(PlaylistSerializer(playlist).data, status=status.HTTP_200_OK)
		else:
			return Response({'Bad request': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)