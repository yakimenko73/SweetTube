from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
	class Meta:
		model = Room
		fields = ('id', 'code', 'host', 'created_at',
			'moder_can_add', 'moder_can_remove', 'moder_can_move',
			'moder_can_playpause', 'moder_can_seek', 'moder_can_skip',
			'moder_can_use_chat', 'moder_can_kick', 'quest_can_add',
			'quest_can_remove', 'quest_can_move', 'quest_can_playpause',
			'quest_can_seek', 'quest_can_skip', 'quest_can_use_chat', 
			'quest_can_kick'
			)


class RoomSettingsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Room
		fields = fields = (
			'moder_can_add', 'moder_can_remove', 'moder_can_move',
			'moder_can_playpause', 'moder_can_seek', 'moder_can_skip',
			'moder_can_use_chat', 'moder_can_kick', 'quest_can_add',
			'quest_can_remove', 'quest_can_move', 'quest_can_playpause',
			'quest_can_seek', 'quest_can_skip', 'quest_can_use_chat', 
			'quest_can_kick'
			)