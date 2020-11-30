from django.shortcuts import render
from django.http import HttpResponse


def index(request):
	""" Представление домашней страницы """
	return render(request, 'home/index.html', { 
		'error_message': "You did'nt select a choice.",
		})


def privacy(request):
	""" Представление страницы приватности """
	return render(request, 'home/privacy.html', {
		'error_message': "Something went wrong :( ",
		})


def contact(request):
	""" Представление страницы контактов """
	return render(request, 'home/contact.html', {
		'error_message': "Something went wrong :( ",
		})


def terms_of_service(request):
	""" Представление страницы условий использования """
	return render(request, 'home/tos.html', {
		'error_message': "Something went wrong :( ",
		})