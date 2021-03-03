from django.db import models
from user.models import User


class Message(models.Model):
	author = models.ForeignKey(User, related_name="author", on_delete=models.CASCADE)
	content = models.TextField()
	timestamp = models.DateTimeField(auto_now_add=True)