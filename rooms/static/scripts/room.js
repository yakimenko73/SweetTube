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
		else if (data.type === "update_user_list")
			updateUser(data.userId, data.userNickname, data.userColor, data.isAdd)
		else
			addMessageToChatArea(data.message, data.color, data.author)
	};

	socket.onopen = function(e) {
		localStorage.setItem(roomName, 1);
	};

	socket.onclose = function(e) {
		localStorage.setItem(roomName, 0);
	};

	window.onbeforeunload = function() {
		socket.close();
	};
	
	window.onunload = function() {
		socket.close();
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
	
	document.querySelector('#btnPlaylist').onclick = function() {
		clickPlaylist();
	};
		
	document.querySelector('#btnChat').onclick = function() {
		clickChat();
	};
		
	document.querySelector('#btnSettings').onclick = function() {
		clickSetting();
	};
		
	document.querySelector('#btnCloseOverlay').onclick = function() {
		clickCloseSettings();
	};
		
	document.querySelector('#overlay').onclick = function() {
		clickCloseSettings();
	};
	
	document.querySelector('#pick_u_color').onclick = function() {
		if(colorPickerIsVisible())
			deleteClass("color_picker_popup", "color_picker_popup_visible");
		else
			changeClass("color_picker_popup", "color_picker_popup_visible");
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
		chatLog.scrollTop = chatLog.scrollHeight;
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
		if(isIncrement)
			var newCounter = oldCounter + count;
		else
			var newCounter = count;
		if (newCounter < 0)
			newCounter = 0;
		userCounter.textContent = newCounter;
	};

	function updateUser(id, name, color, isAdd = true) {
		if(!isAdd) {
			document.getElementById(id).remove();
			return;
		}
		
		let userList = document.getElementById("user_list");
		let panelUser = document.createElement("li");
		let userName = document.createElement("div");
		
		if (!document.getElementById(id)) {
			panelUser.appendChild(userName);
			userList.appendChild(panelUser);
			
			panelUser.id = id;
			setColorForUserList(panelUser.id, color);
			changeClass(panelUser.id, "user");
			
			userName.id = `${id}_name`;
			userName.style = "font-weight: bold;";
			userName.textContent = name;
			changeClass(userName.id, "name");
		};
	};
	
	function setColorForUserList(id, color) {
		let panelUser = document.getElementById(id);
		panelUser.style = `border-right: 5px solid ${color}`;
	};

	function changeClass(id, style) {
		let elementTab = document.getElementById(id);
		elementTab.classList.add(style);
	};
	
	function deleteClass(id, style) {
		let elementTab = document.getElementById(id);
		if (elementTab.classList.contains(style))
		elementTab.classList.remove(style);
	};
	
	function clickCloseSettings() {
		deleteClass("overlay", "overlay_visible");
		deleteClass("settings_tab", "settings_visible");
	};
	
	function clickSetting() {
		changeClass("overlay", "overlay_visible");
		changeClass("settings_tab", "settings_visible");
	};
	
	function clickPlaylist() {
		delete_all_class_for_panel();
		changeClass("btnPlaylist", "tab_selected");
		changeClass("video_playlist", "tab_visible");
	};
	
	function clickChat() {
		delete_all_class_for_panel();
		changeClass("btnChat", "tab_selected");
		changeClass("chat_tab", "tab_visible");
	};
	
	function delete_all_class_for_panel() {
		deleteClass("btnPlaylist", "tab_selected");
		deleteClass("video_playlist", "tab_visible");
		deleteClass("btnChat", "tab_selected");
		deleteClass("chat_tab", "tab_visible");
		deleteClass("btnSettings", "tab_selected");
	};

	function is_checked(id) {
		let checkbox = document.getElementById(id);
		if(checkbox.classList.contains("checked"))
			return true;
		return false;
	};
	
	function colorPickerIsVisible() {
		let checkbox = document.getElementById("color_picker_popup");
	
		if(checkbox.classList.contains("color_picker_popup_visible"))
			return true;
		return false;
	};  
	
	function change_checkbox(id, checked = null) {
		if (checked != null)
		{
			if(checked)
				changeClass(id, "checked");
			else
				deleteClass(id, "checked");
			return;
		}
		
		if(is_checked(id))
			deleteClass(id, "checked");
		else
			changeClass(id, "checked");
	};
};