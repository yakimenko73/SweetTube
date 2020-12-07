from rest_framework import serializers
from .models import Room, User


class RoomSerializer(serializers.ModelSerializer):
	class Meta:
		model = Room
		fields = ('id', 'code', 'host', 'created_at',
			'moder_can_add', 'moder_can_remove', 'moder_can_move',
			'moder_can_playpause', 'moder_can_seek', 'moder_can_skip',
			'moder_can_use_chat', 'moder_can_kick', 'guest_can_add',
			'guest_can_remove', 'guest_can_move', 'guest_can_playpause',
			'guest_can_seek', 'guest_can_skip', 'guest_can_use_chat', 
			'guest_can_kick'
			)


class RoomSettingsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Room
		fields = (
			'moder_can_add', 'moder_can_remove', 'moder_can_move',
			'moder_can_playpause', 'moder_can_seek', 'moder_can_skip',
			'moder_can_use_chat', 'moder_can_kick', 'guest_can_add',
			'guest_can_remove', 'guest_can_move', 'guest_can_playpause',
			'guest_can_seek', 'guest_can_skip', 'guest_can_use_chat', 
			'guest_can_kick'
			)


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('user_status', )
