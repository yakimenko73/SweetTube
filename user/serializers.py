from rest_framework import serializers

from room.models import Room
from .models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('user_status', 'room', 'user_nickname')
