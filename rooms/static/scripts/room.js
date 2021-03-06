const roomName = JSON.parse(document.getElementById('room-name').textContent);
const userNickname = JSON.parse(document.getElementById('user-nickname').textContent);
const userColor = JSON.parse(document.getElementById('user-color').textContent);
const socket = new WebSocket(
	'ws://' +
	window.location.host +
	'/ws/chat/' +
	roomName +
	'/'
);

socket.onmessage = function(e) {
	const data = JSON.parse(e.data);
	if (data.type === "visitors") {
		updateUserCounter(isIncrement=data.isIncrement, count=data.value);
	}
	else
		addMessageToChatArea(data.message, data.color, data.author)
};

socket.onclose = function(e) {
	console.log("Web socket closed unexpectedly");
};

socket.onopen = function(e) {
	console.log("Web socket opened");
};

document.querySelector('#chat_input').onkeyup = function(e) {
	if (e.keyCode === 13) { // enter, return
		const messageInputDom = document.querySelector('#chat_input');
		const message = messageInputDom.value;
		socket.send(JSON.stringify({
			'message': message,
			'author': userNickname,
			'color': userColor,
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

	for(let textMessage = 0; textMessage < textForMessage[typeMesssage].length; textMessage++) {
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