const roomName = JSON.parse(document.getElementById('room-name').textContent);
const userNickname = JSON.parse(document.getElementById('user-nickname').textContent);
const userSessionid = JSON.parse(document.getElementById('user-sessionid').textContent);
const userColor = JSON.parse(document.getElementById('user-color').textContent);

if (localStorage.getItem(roomName) === '1') {
	var request = new XMLHttpRequest();
	request.open('POST', window.location, false);  // `false` makes the request synchronous
	let body = "alreadyInTheRoom";
	request.send(body);
	
	document.head.innerHTML = request.responseText;
	document.body.innerHTML = request.responseText;
}
else {
	var player;
	function onYouTubeIframeAPIReady() {
		// const player = new YT.Player('player', {
		//   height: '360',
		//   width: '640',
		//   videoId: 'https://www.youtube.com/embed/MvtuZ_MOBJ4',
		//   playerVars: { 'autoplay': 1, 'controls': 1, 'disablekb': 1, 'origin': window.location.hostname },
		//   events: {
		// 	'onReady': onPlayerReady,
		// 	'onStateChange': onPlayerStateChange
		//   }
		// });
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
		let body = roomName;
		request.send(body);
	  };

	function onPlayerReady(event) {
		event.target.playVideo();
		event.target.mute();
	};

	function onPlayerStateChange(event) {
		let clearTime = Math.round(event.target.getCurrentTime());
		let videoDuration = event.target.getDuration();
		switch (event.data) {
			case 1:
				if (clearTime == 0)
					console.log('started ' + clearTime);
				else
					console.log('playing ' + clearTime);
				break;
			case 2:
				if (videoDuration - clearTime != 0)
					console.log('paused');
				break;
			case 0:
				console.log('ended');
				break;
			case 3:
				console.log("buffering " + Math.round(event.target.getCurrentTime()));
		};
	};

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
			updateUserCounter(data.isIncrement, data.value);
		else 
		{
			if (data.type === "system_message")
				addMessageToChatArea(data.message);	
			else 
			{
				if (data.type === "update_user_list")
					updateUserList(data.userId, data.userNickname, data.userColor, data.isAdd);
				else
					addMessageToChatArea(data.message, data.color, data.author);
			}

		}
	};

	socket.onopen = function(e) {
		localStorage.setItem(roomName, 1);
	};

	socket.onclose = function(e) {
		localStorage.setItem(roomName, 0);
	};

	setEventForCheckboxes();
	loadButtons();
	
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
			if (checkingMessageForErrors(message))
			{
				messageInputDom.value = null;
				return;
			}
				
			socket.send(JSON.stringify({
				'type': "chat_message",
				'message': message,
				'author': userNickname,
				'color': userColor,
			}));
			messageInputDom.value = '';
		};
	};

	document.querySelector('#search_input').oninput = function() {
		const url = document.querySelector('#search_input').value;
		let regexp = /https:\/\/www\.youtube\.com\/watch\?v=\w{11}/;

		if (checkValidUrl(url, regexp))
		{
			let info = getInfoAboutVideo(url);
			const existUndefined = (element) => element == undefined; 

			if(info.some(existUndefined))
				return;

			setInfoInSearchResult(info[0], info[2], info[1], info[3]);
			changeClass("search_result_wrapper", "visible");
			deleteClass("noplaylist", "visible");
			document.querySelector(".search_result_wrapper").style = "display: block";
		}
		else
		{
			deleteClass("search_result_wrapper", "visible");
			document.querySelector(".search_result_wrapper").style = "display: none";
		}
			
	};

	document.querySelector("#search_input").onfocus = function() {
		if(checkValidUrl(document.querySelector('#search_input').value))
			changeClass("search_result_wrapper", "visible");
	}

	document.querySelector("#search_input").onblur = function() {
		deleteClass("search_result_wrapper", "visible");
	}

	document.querySelector("#search_result_wrapper").onclick = function() {
		addDOMVideoInPlayList();
		deleteClass("search_result_wrapper", "visible");
		document.querySelector('#search_input').value = '';
	};
	
	document.querySelector('#search_input').onkeyup = function(e) {
		if (e.keyCode == 13)
		{
			addDOMVideoInPlayList();
			deleteClass("search_result_wrapper", "visible");
			document.querySelector('#search_input').value = '';
		}
		
	};
	
	window.addEventListener('resize', event => {loadButtons();})

	document.querySelector('#color_picker').onclick = function() {
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

		if (message==null)
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
		if(buttonsExistsInParent(id_parent_element))
			return;

		let nav = 
		`<nav class="tabs noselect" id="main_nav">
			<div class="nohide" t="playlist" id="btnPlaylist">
				Playlist
				<div class="notify" val="0">0</div>
			</div>
			<div class="nohide tab_selected" t="chat" id="btnChat">
				Chat
				<div class="notify" val="0">0</div>
			</div>
			<div class="nohide" id="btnSettings">Settings</div>
		</nav>`;

		if(buttonsExists())
			document.getElementById("main_nav").remove();

		document.querySelector(`.${id_parent_element}`).insertAdjacentHTML("beforeend", nav);
	};
	
	function buttonsExistsInParent(id_parent_element) {
		if (document.getElementById("main_nav") == id_parent_element)
			return true;
		return false; 
	};
	
	function loadButtons() {
		let width = document.documentElement.clientWidth;
		if (width > 977)
			addButtons("header");
			
		else
			addButtons("center");

		setEventsForButtons();
	};

	function buttonsExists() {
		if (document.getElementById("main_nav") == null )
			return false;
		return true;
	}

	function setEventsForButtons() {
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
	}

	function getVideoId(url) {
		let regexp = /v=\w*/;

		try {
			if (url.match(regexp)[0] == null)
				return null;
		} catch (error) {
			return null;
		}
		
		let id = url.match(regexp)[0];

		return id.replace(/v=/, '');
	}

	function setInfoInSearchResult(id, channel, title, preview) {
		document.querySelector(".search_result").id = id;
		document.querySelector("#preview_img").src = preview;
		document.querySelector(".title").textContent = title;
		document.querySelector(".channel").textContent = channel;
	}

	function getInfoAboutVideo(url) {
		let request = new XMLHttpRequest();
		request.open('GET', 
			'https://noembed.com/embed?url=' + url,
			false
		);
		request.send();
		let response = JSON.parse(request.response);
		
		let info = [];
		info.push(getVideoId(url)); 
		info.push(response.title);
		info.push(response.author_name);
		info.push(response.thumbnail_url);
		
		// info[0] - id
		// info[1] - title
		// info[2] - channel
		// info[3] - preview
		return info;
	}

	function checkValidUrl(url, format) {
		try {
			if (url.match(format).length > 0)
				return true;
		}
		catch (error)
		{
			return false;
		}
	}

	function addDOMVideoInPlayList() {
		
		const url = document.querySelector('#search_input').value;
		let userAdded = getCurrentUser();
		let info = getInfoAboutVideo(url);
		let ul_videoList = document.querySelector("#video_list");

		let img = document.createElement("img");
		img.src = info[3];

		let div_title = document.createElement("div");
		div_title.className = "title";
		div_title.textContent = info[1];

		let div_info = document.createElement("div");
		div_info.className = "info";
		div_info.textContent = `Added by${userAdded}`;

		let div_thumbail = document.createElement("div");
		div_thumbail.className = "thumbnail";
		div_thumbail.appendChild(img);

		let div_decs = document.createElement("div");
		div_decs.className = "desc";
		div_decs.appendChild(div_title);
		div_decs.appendChild(div_info);

		let li = document.createElement("li");
		li.id = `${info[0]}_!${new Date().toUTCString()}!`;
		li.appendChild(div_thumbail);
		li.appendChild(div_decs);
		
		ul_videoList.appendChild(li);

		
	}

	function checkingMessageForErrors(message) {
		let regexp = /^\s*$/;
		if (message == null)
			return true;
		try {
			if (message.match(regexp).length > 0)
				return true;
		}
		catch {
			return false;
		}
		
	}

	function getCurrentUser() {
		//return document.querySelector("#input_userName").value;
		return "musslim";
	}
	
	//function deleteDOMVideoInPlayList()
};

