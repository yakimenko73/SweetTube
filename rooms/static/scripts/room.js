const roomName = JSON.parse(document.getElementById('room-name').textContent);
const userNickname = JSON.parse(document.getElementById('user-nickname').textContent);
const chatSocket = new WebSocket(
	'ws://' +
	window.location.host +
	'/ws/chat/' +
	roomName +
	'/'
);

chatSocket.onmessage = function(e) {
	const data = JSON.parse(e.data);
	if (data.type === "visitors") {
		updateUserCounter(isIncrement=data.isIncrement, count=data.value);
	}
	else
		addMessageToChatArea(data.message, 'green', data.author)
};

chatSocket.onclose = function(e) {
	console.log('Chat socket closed unexpectedly');
};

chatSocket.onopen = function(e) {
	console.log('Chat socket open');
};

document.querySelector('#chat_input').onkeyup = function(e) {
	if (e.keyCode === 13) { // enter, return
		const messageInputDom = document.querySelector('#chat_input');
		const message = messageInputDom.value;
		chatSocket.send(JSON.stringify({
			'message': message,
			'author': userNickname,
		}));
		messageInputDom.value = '';
	};
};

function addMessageToChatArea(message, colorForUsernName=null, mailer=null) {
	let typeMesssage = 0;
	
	let stylesForMessage = [
		[ "color: rgb(100, 100, 100)" ],
		[
			`font-weight: bold; color: ${colorForUsernName}`,
			"color: rgb(180, 180, 180)",
		]
	];

	let textForMessage = [
		[ message ],
		[ mailer, `: ${message}` ]
	];

	let chatLog = document.getElementById("chat_log");
	let newMessage = document.createElement("li");

	if (message=="")
		return

	if (mailer!=null) // if mailer == null -> system message
		typeMesssage = 1;

	for(let textMessage = 0; textMessage < textForMessage[type_message].length; textMessage++) {
		let style = stylesForMessage[typeMesssage][textMessage];
		let text = textForMessage[typeMesssage][textMessage];
		let span = makeSpan(style, text);
		newMessage.appendChild(span);
	}

	chatLog.appendChild(newMessage);
};

function makeSpan(style, text) {
	let span = document.createElement("span");
	span.style = style;
	span.textContent = text;
	return span;
};

function updateUserCounter(isIncrement=true, count=1) {
	let userCounter = document.getElementById("user-counter");
	let oldCounter = Number(userCounter.textContent);
	if(isIncrement) {
		var newCounter = oldCounter + count;
	}
	else
		var newCounter = count;
	if (newCounter < 0)
		newCounter = 0;
	userCounter.textContent = newCounter;
};