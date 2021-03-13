const roomName = JSON.parse(document.getElementById('room-name').textContent);
const sessionKey = JSON.parse(document.getElementById('session-key').textContent);
const chatSocket = new WebSocket(
	'ws://' +
	window.location.host +
	'/ws/chat/' +
	roomName +
	'/'
);

chatSocket.onmessage = function(e) {
	const data = JSON.parse(e.data);
	document.querySelector('#chat-log').value += (data.message + '\n');
};

chatSocket.onclose = function(e) {
	alert('Chat socket closed unexpectedly');
};

document.querySelector('#chat_input').onkeyup = function(e) {
	if (e.keyCode === 13) { // enter, return
		const messageInputDom = document.querySelector('#chat_input');
		const message = messageInputDom.value;
		chatSocket.send(JSON.stringify({
			'message': message,
			'author': sessionKey,
			'room_name': roomName
		}));
		messageInputDom.value = '';
	}
};