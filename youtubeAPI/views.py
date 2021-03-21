import requests
import json

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
from user.models import User, Session


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


class CreateVideoAPIView(APIView):
	video_serializer_class = VideoSerializer
	renderer_classes = [JSONRenderer, ]
	authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication, )

	def post(self, request, format=None):
		data = json.loads(request.body.decode("utf-8"))
		room_id = Room.objects.get(code=data["room_name"]).id
		playlist_id = Playlist.objects.get(room=room_id).id
		session_id = Session.objects.get(session_key=data["user_sessionid"]).id
		user_id = User.objects.get(session=session_id, room=room_id).id

		clear_data = {"video_url": data["video_url"], 
			"preview_url": data["video_preview_img_url"],
			"title": data["video_title"],
			"playlist": playlist_id,
			"user": user_id,
		}
		video_serializer = self.video_serializer_class(data=clear_data)
		if video_serializer.is_valid():
			video = Video(video_url=clear_data["video_url"], 
				preview_url=clear_data["preview_url"],
				title=clear_data["title"],
				playlist=Playlist.objects.get(id=playlist_id),
				user=User.objects.get(id=user_id),
			)
			video.save()
			return Response(VideoSerializer(video).data, status=status.HTTP_201_CREATED)
		else:
			return Response({'Bad request': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)