from rest_framework import serializers

from .models import User, Session

class SessionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Session
		fields = ('session_key', )

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('user_status', 'user_nickname', 'user_color', 'room', )