const roomName = JSON.parse(document.getElementById('room-name').textContent);
const roomPermissions = JSON.parse(document.getElementById('room-permissions').textContent);
const userNickname = JSON.parse(document.getElementById('user-nickname').textContent);
const userSessionid = JSON.parse(document.getElementById('user-sessionid').textContent);
const userColor = JSON.parse(document.getElementById('user-color').textContent);
const userStatus = JSON.parse(document.getElementById('user-status').textContent);

if (localStorage.getItem(roomName) === '1') {
	var request = new XMLHttpRequest();
	request.open('POST', window.location, false);  // `false` makes the request synchronous
	body = "alreadyInTheRoom";
	request.send(body);
	
	document.head.innerHTML = request.responseText;
	document.body.innerHTML = request.responseText;
}
else {
	var player;
	const socket = new WebSocket(
		'ws://' +
		window.location.host +
		'/ws/chat/' +
		roomName +
		'/'
	);
	loadButtons();
	setEventForCheckboxes();
	
	function onYouTubeIframeAPIReady() {
		var request = new XMLHttpRequest();
		request.open('POST', 
			window.location.protocol + 
			"//" + 
			window.location.hostname + 
			":" + 
			window.location.port + 
			"/api/youtube/playlist/", 
			true
		);
		body = roomName;
		request.send(body);
	};

	function onPlayerReady(event) {
		event.target.mute();
		socket.send(JSON.stringify({'type': "get_player_config"}));
		setInterval(() => 
			socket.send(JSON.stringify({
				'type': "update_player_state",
				'state': videoPlayerHandler(videoId=null, flag="getCurrentState"),
				'time': videoPlayerHandler(videoId=null, flag="getCurrentTime")
			})), 
			1000
		);
	};

	function onPlayerStateChange(event) {
		currentTime = event.target.getCurrentTime();
		videoDuration = event.target.getDuration();
		switch (event.data) {
			case 1: // started/playing
				if (currentTime == 0)
					console.log('started ' + currentTime);
				else {
					console.log('playing ' + currentTime);
					if (localStorage.getItem("isCallingPlayPauseVideo") != "1") {
						switch(userStatus) {
							case "HO":
								socket.send(JSON.stringify({
									'type': "play/pause",
									'sender': userSessionid,
									'side': "play", 
									'time': event.target.getCurrentTime()
								}));
								break;
							case "MO":
								if (!roomPermissions.moder_can_playpause) {
									localStorage.setItem("isCallingPlayPauseVideo", 1);
									event.target.pauseVideo();
								}
								else 
									socket.send(JSON.stringify({
										'type': "play/pause",
										'sender': userSessionid,
										'side': "play",
										'time': event.target.getCurrentTime()
									}));
								break;
							case "GU":
								if (!roomPermissions.guest_can_playpause) {
									localStorage.setItem("isCallingPlayPauseVideo", 1);
									event.target.pauseVideo();
								}
								else 
									socket.send(JSON.stringify({
										'type': "play/pause",
										'sender': userSessionid,
										'side': "play",
										'time': event.target.getCurrentTime()
									}));
								break;
						};
					}
					else
						localStorage.removeItem("isCallingPlayPauseVideo"); 
				};
				break;
			case 2: // pause
				console.log("paused " + currentTime);
				if (videoDuration - currentTime != 0) {
					if (localStorage.getItem("isCallingPlayPauseVideo") != "1") {
						switch(userStatus) {
							case "HO":
								socket.send(JSON.stringify({
									'type': "play/pause",
									'sender': userSessionid,
									'side': "pause",
									'time': event.target.getCurrentTime()
								}));
								break;
							case "MO":
								if (!roomPermissions.moder_can_playpause) {
									localStorage.setItem("isCallingPlayPauseVideo", 1);
									event.target.playVideo();
								}
								else 
									socket.send(JSON.stringify({
										'type': "play/pause",
										'sender': userSessionid,
										'side': "pause",
										'time': event.target.getCurrentTime()
									}));
								break;
							case "GU":
								if (!roomPermissions.guest_can_playpause) {
									localStorage.setItem("isCallingPlayPauseVideo", 1);
									event.target.playVideo();
								}
								else 
									socket.send(JSON.stringify({
										'type': "play/pause",
										'sender': userSessionid,
										'side': "pause",
										'time': event.target.getCurrentTime()
									}));
								break; 
						};
					}
					else
						localStorage.removeItem("isCallingPlayPauseVideo");
				};
				break;
			case 0: // ended
				console.log('ended ' + currentTime);
				break;
			case 3: // buffering
				console.log("buffering " + currentTime);
		};
	};

	function videoPlayerHandler(videoId=null, flag=null, seconds=null) {
		switch(flag) {
			case "start":
				document.getElementById("novideo").className = "novideo";
				player = new YT.Player('player', {
					height: '360',
					width: '640',
					videoId: videoId,
					host: "https://www.youtube-nocookie.com",
					playerVars: {
						autoplay: 1,
						controls: 1,
						disablekb: 1,
						enablejsapi: 1,
						iv_load_policy: 3,
						origin: "http://127.0.0.1:8000/",
						'playsinline': 1
					},
					events: {
						'onReady': onPlayerReady,
						'onStateChange': onPlayerStateChange
					}
				});
				break;
			case "pause":
				localStorage.setItem("isCallingPlayPauseVideo", 1);
				player.pauseVideo();
				player.seekTo(seconds);
				break;
			case "play":
				localStorage.setItem("isCallingPlayPauseVideo", 1);
				player.seekTo(seconds);
				player.playVideo();
				break;
			case "getCurrentTime":
				return player.getCurrentTime();
			case "getCurrentState":
				return player.getPlayerState();
		};
	};

	socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		switch (data.type) {
			case "chat_message":
				addMessageToChatArea(data.message, data.color, data.author);
				break;
			case "update_user_counter":
				switch (data.flag) {
					case "left":
						message = data.userNickname + " left the room";
						break;
					case "join":
						message = data.userNickname + " joined the room";
						break;
				}
				addMessageToChatArea(message=message);
				updateUserCounter(count=data.value);
				break;
			case "update_user_list":
				updateUserList(data.userId, data.userNickname, data.userColor, data.isAdd);
				break;
			case "new_video":
				var videoId = parseIdFromURL(data.videoURL);
				videoPlayerHandler(videoId, flag="start");
				break;
			case "play/pause":
				flag = data.side === "pause" ? "pause" : "play";
				if (data.sender != userSessionid)
					videoPlayerHandler(videoId=null, flag=flag, seconds=data.time);
				break;
			case "set_player_config":
				state = data.state === "2" ? "pause" : "play";
				videoPlayerHandler(videoId=null, flag=state, seconds=data.current_time);
				break;
		};
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

	document.querySelector('#search_input').onkeyup = function(e) {	
		if (e.keyCode >= 48 & e.keyCode <= 90) { // characters and numbers
			const urlInputDom = document.querySelector('#search_input');
			const url = urlInputDom.value;
			var request = new XMLHttpRequest();
			request.open('GET', 
				'https://noembed.com/embed?url=' + url,
				false
			);
			request.send();
			response = JSON.parse(request.response)
			if (!response.error) {
				videoTitle = response.title;
				videoAuthor = response.author_name;
				videoPreviewImgURL = response.thumbnail_url;
				var request = new XMLHttpRequest();
				request.open('POST', 
					window.location.protocol + 
					"//" + 
					window.location.hostname + 
					":" + 
					window.location.port + 
					"/api/youtube/video/", 
					true
				);
				body = JSON.stringify({"room_name": roomName,
					"user_sessionid": userSessionid,
					"video_url": url, 
					"video_preview_img_url": videoPreviewImgURL,
					"video_title": videoTitle
				})
				request.setRequestHeader("Content-Type", "application/json");
				request.send(body);
				// sharing video
				socket.send(JSON.stringify({
					'type': "new_video",
					'userNickname': userNickname,
					'videoURL': url,
					'videoPreviewURL': videoPreviewImgURL,
					'videoTitle': videoTitle
				}));
			};
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

	function setEventForCheckboxes() {
		// g - guest, m - moderator, o - owner
		let listRoles = [ "g", "m", "o" ];
		let list_types = [ "add", "remove", "move", "play", "seek", "skip", "chat", "kick" ];
	
		for(let role = 0; role < listRoles.length; role++) {
			for(let type = 0; type < list_types.length; type++) {
				let id = `${listRoles[role]}_${list_types[type]}`;
	
				document.querySelector(`#${id}`).onclick = function() {
					changeCheckbox(id);
				};
			};
		};
	
		document.querySelector("#cb_p").onclick = function() {
			changeCheckbox("cb_p");
		};
	
		document.querySelector("#cb_rn").onclick = function() {
			changeCheckbox("cb_rn");
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
		chatLog.scrollTop = chatLog.scrollHeight;
	};

	function makeSpan(style, text) {
		let span = document.createElement("span");
		span.style = style;
		span.textContent = text;
		return span;
	};

	function updateUserCounter(count=0) {
		let userCounter = document.getElementById("user-counter");
		var newCounter = count;
		if (newCounter < 0)
			newCounter = 0;
		userCounter.textContent = newCounter;
	};

	function updateUserList(id, name, color, isAdd=true) {
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
		deleteAllClassForPanel();
		changeClass("btnPlaylist", "tab_selected");
		changeClass("video_playlist", "tab_visible");
	};
	
	function clickChat() {
		deleteAllClassForPanel();
		changeClass("btnChat", "tab_selected");
		changeClass("chat_tab", "tab_visible");
	};
	
	function deleteAllClassForPanel() {
		deleteClass("btnPlaylist", "tab_selected");
		deleteClass("video_playlist", "tab_visible");
		deleteClass("btnChat", "tab_selected");
		deleteClass("chat_tab", "tab_visible");
		deleteClass("btnSettings", "tab_selected");
	};

	function isChecked(id) {
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
	
	function changeCheckbox(id, checked=null) {
		if (checked != null)
		{
			if(checked)
				changeClass(id, "checked");
			else
				deleteClass(id, "checked");
			return;
		}
		
		if(isChecked(id))
			deleteClass(id, "checked");
		else
			changeClass(id, "checked");
	};

	function addButtons(id_parent_element) {
		if(buttonsExists(id_parent_element))
			return;
		let nav = 
		`<nav class="tabs noselect" id="main_nav">
			<div class="nohide" t="playlist" id="btnplaylist">
				Playlist
				<div class="notify" val="0">0</div>
			</div>
			<div class="nohide tab_selected" t="chat" id="btnchat">
				Chat
				<div class="notify" val="0">0</div>
			</div>
			<div class="nohide" id="btnSettings">Settings</div>
		</nav>`;
		document.getElementById("main_nav").remove();
		document.getElementById(id_parent_element).insertAdjacentHTML("beforeend", nav);
	};
	
	function buttonsExists(id_parent_element) {
		if (document.getElementById("main_nav").parentElement.id == id_parent_element)
			return true;
		return false; 
	};
	
	function loadButtons() {
		let width = document.documentElement.clientWidth;
		if (width > 928)
			addButtons("header");
		else
			addButtons("center");
	};

	function parseIdFromURL(url) {
		var id = url.split('v=')[1];
		if (!id)
			var id = url.split('be/')[1];
		var ampersandPosition = id.indexOf('&');
		if(ampersandPosition != -1)
			id = id.substring(0, ampersandPosition);
		return id;
	};
};