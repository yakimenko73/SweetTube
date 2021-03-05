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
	add_message(data.message, 'green', data.author)
};

chatSocket.onclose = function(e) {
	console.log('Chat socket closed unexpectedly');
};

chatSocket.onopen = function(e) {
	console.log("Chat socket open");
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
	}
};

function add_message(message, color_for_username = null, mailer = null) {
    let type_message = 0;
    
    let styles_for_message = [
        [ "color: rgb(100, 100, 100)" ],
        [
            `font-weight: bold; color: ${color_for_username}`,
            "color: rgb(180, 180, 180)",
        ]
    ];

    let text_for_message = [
        [ message ],
        [ mailer, `: ${message}` ]
    ];

    let chat_log = document.getElementById("chat_log");
    let new_message = document.createElement("li");

    if (message == "")
        return

    if (mailer != null) // if mailer == null -> system message
        type_message = 1;

    for(let text_message = 0; text_message < text_for_message[type_message].length; text_message++) {
        let style = styles_for_message[type_message][text_message];
        let text = text_for_message[type_message][text_message];
        let span = make_span(style, text);
        new_message.appendChild(span);
    }

    chat_log.appendChild(new_message);
}

function make_span(style, text) {
    let span = document.createElement("span");
    span.style = style;
    span.textContent = text;
    return span;
}