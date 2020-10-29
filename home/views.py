from django.shortcuts import render
from django.http import HttpResponse

def index(request):
	""" Тестовое представление домашней страницы """
	return HttpResponse('Hello world. I am index view')
