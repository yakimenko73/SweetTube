from django.contrib import admin
from .models import User, Session

admin.site.register(User)
admin.site.register(Session)