const roomName = JSON.parse(document.getElementById('room-name').textContent);
const userNickname = JSON.parse(document.getElementById('user-nickname').textContent);
const userSessionid = JSON.parse(document.getElementById('user-sessionid').textContent);
const userColor = JSON.parse(document.getElementById('user-color').textContent);

if (localStorage.getItem(roomName) === '1') {
	var request = new XMLHttpRequest();
	request.open('POST', window.location, false);  // `false` makes the request synchronous
	body = "alreadyInTheRoom";
	request.send(body);
	
	document.head.innerHTML = request.responseText;
	document.body.innerHTML = request.responseText;
}
else {
	const socket = new WebSocket(
		'ws://' +
		window.location.host +
		'/ws/chat/' +
		roomName +
		'/'
	);

	socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.type === "visitors")
			updateUserCounter(isIncrement=data.isIncrement, count=data.value);
		else if (data.type === "system_message")
			addMessageToChatArea(data.message)
		else
			addMessageToChatArea(data.message, data.color, data.author)
	};

	socket.onopen = function(e) {
		socket.send(JSON.stringify({
			'type': "system_message",
			'message': "joined the room",
			'author': userNickname,
			'color': null,
		}));
		localStorage.setItem(roomName, 1);
	};

	socket.onclose = function(e) {
		localStorage.setItem(roomName, 0);
	};

	window.onbeforeunload = function() {
		socket.close();
		return '';
	};

	document.querySelector('#chat_input').onkeyup = function(e) {
		if (e.keyCode === 13) { // enter, return
			const messageInputDom = document.querySelector('#chat_input');
			const message = messageInputDom.value;
			socket.send(JSON.stringify({
				'type': "chat_message",
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

		for (let textMessage = 0; textMessage < textForMessage[typeMesssage].length; textMessage++) {
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
};