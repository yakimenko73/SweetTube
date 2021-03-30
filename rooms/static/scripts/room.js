(function () {
	const roomName = JSON.parse(document.getElementById('room-name').textContent);
	const roomPermissions = JSON.parse(document.getElementById('room-permissions').textContent);
	const userNickname = JSON.parse(document.getElementById('user-nickname').textContent);
	const userSessionid = JSON.parse(document.getElementById('user-sessionid').textContent);
	const userColor = JSON.parse(document.getElementById('user-color').textContent);
	const userStatus = JSON.parse(document.getElementById('user-status').textContent);

	if (localStorage.getItem(roomName) === '1') {
		let  request = new XMLHttpRequest();
		request.open('POST', window.location, false);  // `false` makes the request synchronous
		let body = "alreadyInTheRoom";
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

		function onPlayerReady(event) {
			event.target.mute();
			socket.send(JSON.stringify({'type': "get_player_config"}));
			setInterval(() => 
				socket.send(JSON.stringify({
					'type': "update_player_state",
					'state': player.getPlayerState(),
					'time': player.getCurrentTime()
				})), 
				userStatus == "GU" ? 5000 : 1000 
			)
		};

		function onPlayerStateChange(event) {
			let currentTime = event.target.getCurrentTime();
			let videoDuration = event.target.getDuration();
			switch (event.data) {
				case 1: // started/playing
					if (currentTime != 0) {
						if (localStorage.getItem("isCallingPlayPauseVideo") != "1") {
							switch(userStatus) {
								case "HO":
									socket.send(JSON.stringify({
										'type': "play/pause",
										'sender': userSessionid,
										'side': "play", 
										'time': currentTime
									}));
									break;
								case "MO":
									if (!roomPermissions.moder_can_playpause) {
										localStorage.setItem("isCallingPlayPauseVideo", 1);
										socket.send(JSON.stringify({'type': "get_player_config"}));
									}
									else 
										socket.send(JSON.stringify({
											'type': "play/pause",
											'sender': userSessionid,
											'side': "play",
											'time': currentTime
										}));
									break;
								case "GU":
									if (!roomPermissions.guest_can_playpause) {
										localStorage.setItem("isCallingPlayPauseVideo", 1);
										socket.send(JSON.stringify({'type': "get_player_config"}));
									}
									else 
										socket.send(JSON.stringify({
											'type': "play/pause",
											'sender': userSessionid,
											'side': "play",
											'time': currentTime
										}));
									break;
							};
						}
						else
							localStorage.removeItem("isCallingPlayPauseVideo");
					};
					break;
				case 2: // pause
					if (videoDuration - currentTime != 0) {
						if (localStorage.getItem("isCallingPlayPauseVideo") != "1") {
							switch(userStatus) {
								case "HO":
									socket.send(JSON.stringify({
										'type': "play/pause",
										'sender': userSessionid,
										'side': "pause",
										'time': currentTime
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
											'time': currentTime
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
											'time': currentTime
										}));
									break; 
							};
						}
						else
							localStorage.removeItem("isCallingPlayPauseVideo");
					};
					break;
				case 0: // ended
					socket.send(JSON.stringify({'type': "video_ended"}));
					break;
				case -1: // did not start
					localStorage.removeItem("isCallingPlayPauseVideo");
					break;
			};
		};

		function onPlayerError(event) {
			alert(event.data);
			switch (event.data) {
				case 2: // invalid id
					break;
				case 5: // player related error
					break;
				case 100: // video removed or marked as private
					break;
				case 101: // no embedding
					break;
				case 150: // also no embedding
					break;
			};
		};

		function videoPlayerHandler(videoId=null, flag=null, seconds=null) {
			switch(flag) {
				case "start":
					localStorage.setItem("isCallingPlayPauseVideo", 1);
					deleteClass("novideo", "visible");
					player = new YT.Player('player', {
						height: '360',
						width: '640',
						videoId: videoId,
						host: "https://www.youtube-nocookie.com",
						playerVars: {
							autoplay: 1,
							start: 0,
							controls: 1,
							disablekb: 1,
							enablejsapi: 1,
							iv_load_policy: 3,
							origin: "http://127.0.0.1:8000/",
							'playsinline': 1
						},
						events: {
							'onReady': onPlayerReady,
							'onStateChange': onPlayerStateChange,
							'onError': onPlayerError
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
			};
		};

		socket.onmessage = function(e) {
			const data = JSON.parse(e.data);
			let message = '';
			switch (data.type) {
				case "chat_message":
					addMessageToChatArea(data.message, data.color, data.author);
					let btnChatDOM = document.getElementById("btnChat")
					if (btnChatDOM.className == "nohide") {
						let chatNotifyDOM = btnChatDOM.children[0];
						let notifyNumber = parseInt(chatNotifyDOM.textContent) + 1;
						chatNotifyDOM.textContent = "+" + notifyNumber;
						chatNotifyDOM.className += " visible";
					};
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
					addMessageToChatArea(message);
					updateUserCounter(data.value);
					break;
				case "update_user_list":
					updateUserList(data.userId, data.userNickname, data.userColor, data.isAdd);
					break;
				case "new_video":
					videoId = parseIdFromURL(data.videoURL);
					if (player != undefined) {
						try {
							var currentPlayerState = player.getPlayerState();
						}
						catch (e) {
							var currentPlayerState = 1;
						}
						if (currentPlayerState != 0) {
							addVideoInPlaylist(data.userNickname, 
								videoId, 
								data.videoTitle
							)
							let btnPlaylistDOM = document.getElementById("btnPlaylist")
							if (btnPlaylistDOM.className == "nohide") {
								let playlistNotifyDOM = btnPlaylistDOM.children[0];
								let notifyNumber = parseInt(playlistNotifyDOM.textContent) + 1;
								playlistNotifyDOM.textContent = "+" + notifyNumber;
								playlistNotifyDOM.className += " visible";
							};
						}
						else {
							player.loadVideoById(videoId, 0);
							document.getElementById("videoTitle").textContent = data.videoTitle;
						};
					}
					else {
						videoPlayerHandler(videoId=videoId, flag="start");
						document.getElementById("videoTitle").textContent = data.videoTitle;
					}
					break;
				case "next_video":
					let videoList = document.getElementById("video_list");
					let nextVideo = videoList.firstChild;
					if (nextVideo) {
						let nextVideoId = nextVideo.id;
						let nextVideoTitle = nextVideo.children[1].children[0].textContent;
						nextVideo.remove();
						player.loadVideoById(nextVideoId, 0);
						document.getElementById("videoTitle").textContent = nextVideoTitle;
						if (!videoList.children.length) {
							let noPlaylistDOM = document.getElementById("noplaylist");
							noPlaylistDOM.className += " visible";
						};
					};
					break;
				case "delete_video":
					let playlist = document.getElementById("video_list");
					if (data.sender != userSessionid) {
						let videoDOM = playlist.children[data.videoIndex-1];
						videoDOM.remove(); 
					};
					if (!playlist.children.length) {
						let noPlaylistDOM = document.getElementById("noplaylist");
						noPlaylistDOM.className += " visible";
					};
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

		loadButtons();
		setEventForCheckboxes();
		checkPermissions();

		window.addEventListener('resize', event => {loadButtons()});

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
			}
		};

		document.querySelector('#search_input').oninput = function() {
			const url = document.querySelector('#search_input').value;
			let regexp = /^https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/).*$/;

			if (checkValidUrl(url, regexp))
			{
				let info = getInfoAboutVideo(url);
				const existUndefined = (element) => element == undefined; 

				if(info.some(existUndefined))
					return;

				setInfoInSearchResult(info[0], info[2], info[1]);
				changeClass("search_result_wrapper", "visible");
				document.querySelector(".search_result_wrapper").style = "display: block";
			}
			else
			{
				deleteClass("search_result_wrapper", "visible");
				document.querySelector(".search_result_wrapper").style = "display: none";
			}
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

		document.querySelector("#search_input").onfocus = function() {
			let url = document.querySelector('#search_input').value;
			let regexp = /^https:\/\/www\.youtube\.com\/watch\?v=\w{11}$/;

			if(checkValidUrl(url, regexp))
				changeClass("search_result_wrapper", "visible");
		};

		document.querySelector("#search_input").onblur = function() {
			deleteClass("search_result_wrapper", "visible");
		};

		document.querySelector("#search_result_wrapper").onclick = function() {
			sendNewVideoInSocket();
		};
		
		document.querySelector('#search_input').onkeyup = function(e) {
			if (e.keyCode == 13)
			{
				sendNewVideoInSocket();
			}
		};

		document.querySelector('#color_picker').onclick = function() {
			if(colorPickerIsVisible())
				deleteClass("color_picker_popup", "color_picker_popup_visible");
			else
				changeClass("color_picker_popup", "color_picker_popup_visible");
		};
		
		function addVideoInPlaylist(user, videoId, videoTitle) {
			deleteClass("noplaylist", "visible");
			addDOMVideoInPlayList(user, videoId, videoTitle);
			deleteClass("search_result_wrapper", "visible");
		};

		function sendNewVideoInSocket() {
			let searchInputDOM = document.querySelector('#search_input');
			let url = searchInputDOM.value;
			searchInputDOM.value = '';
			let info = getInfoAboutVideo(url);

			socket.send(JSON.stringify({
				'type': "new_video",
				'userNickname': userNickname,
				'videoURL': url,
				'videoTitle': info[1]
			}));
		};

		function setEventForCheckboxes() {
			// g - guest, m - moderator, o - owner
			let listRoles = [ "g", "m" ];
			let list_types = [ "add", "remove", "move", "play", "seek", "skip", "chat", "kick" ];
		
			for(let role = 0; role < listRoles.length; role++) {
				for(let type = 0; type < list_types.length; type++) {
					let id = `${listRoles[role]}_${list_types[type]}`;
		
					document.querySelector(`#${id}`).onclick = function() {
						changeCheckbox(id);
					}
				}
			}
		
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
		
		function updateUserCounter(count=0) {
			let userCounter = document.getElementById("user-counter");
			let  newCounter = count;
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
			}
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
			let btnPlaylistDOM = document.getElementById("btnPlaylist")
			let playlistNotifyDOM = btnPlaylistDOM.children[0];
			playlistNotifyDOM.classList.remove("visible");
			playlistNotifyDOM.textContent = 0;
		};
		
		function clickChat() {
			deleteAllClassForPanel();
			changeClass("btnChat", "tab_selected");
			changeClass("chat_tab", "tab_visible");
			let btnChatDOM = document.getElementById("btnChat")
			let chatNotifyDOM = btnChatDOM.children[0];
			chatNotifyDOM.classList.remove("visible");
			chatNotifyDOM.textContent = 0;
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
				<div id="btnSettings">Settings</div>`;
			
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
		};
		
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
		};
		
		function setInfoInSearchResult(id, channel, title) {
			document.querySelector(".search_result").id = id;
			document.querySelector("#preview_img").src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;;
			document.querySelector(".title").textContent = title;
			document.querySelector(".channel").textContent = channel;
		};
		
		function getInfoAboutVideo(url) {
			let request = new XMLHttpRequest();
			request.open('GET', 
				'https://noembed.com/embed?url=' + url,
				false
			);
			request.send();
			let response = JSON.parse(request.response);
			
			let info = [];
			info.push(parseIdFromURL(url)); 
			info.push(response.title);
			info.push(response.author_name);
			
			// info[0] - id
			// info[1] - title
			// info[2] - channel
			return info;
		};
		
		function checkValidUrl(url, format) {
			try {
				if (url.match(format).length > 0)
					return true;
			}
			catch (error)
			{
				return false;
			}
		};
		
		function addDOMVideoInPlayList(user, videoId, videoTitle) {
			let userAdded = user;
			let ul_videoList = document.querySelector("#video_list");
		
			let img = document.createElement("img");
			img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
			img.height = 94;
		
			let div_title = document.createElement("div");
			div_title.className = "title";
			div_title.textContent = videoTitle;
		
			let div_info = document.createElement("div");
			div_info.className = "info";
			div_info.textContent = `Added by ${userAdded}`;
		
			let div_thumbail = document.createElement("div");
			div_thumbail.className = "thumbnail";
			div_thumbail.appendChild(img);
		
			let div_decs = document.createElement("div");
			div_decs.className = "desc";
			div_decs.appendChild(div_title);
			div_decs.appendChild(div_info);
		
			let li = document.createElement("li");
			li.id = videoId;
			li.appendChild(div_thumbail);
			li.appendChild(div_decs);
			addAllEventForVideoInPlaylist(li)

			ul_videoList.appendChild(li);
		};

		function deleteDOMVideoInPlayList(videoDOM) {
			let videoIndex = getNumberVideoInPlaylist(videoDOM);
			socket.send(JSON.stringify({
				'type': "delete_video",
				'videoIndex': videoIndex,
				'sender': userSessionid
			}));
			videoDOM.remove();
		};

		function checkingMessageForErrors(message) {
			let regexp = /^\s*$/;
			if (message == null)
				return true;
			try {
				if (message.match(regexp).length > 0)
					return true;
			}
			catch(e) {
				return false; 
			};
			
		};

		function parseIdFromURL(url) {
			let id = url.split('v=')[1];
			if (!id)
				id = url.split('be/')[1];
			let ampersandPosition = id.indexOf('&');
			if(ampersandPosition != -1)
				id = id.substring(0, ampersandPosition);
			return id;
		};

		function getPlaylistOptionHTML() {
			let html = 
			`<div class='playlist_video_options' style= 'display: block'>
				<div class= 'playlist_options_left' style= 'display: block'>
					<div class = 'playlist_btn_up playlist_btn_arrow'></div>
					<div class = 'playlist_btn_down playlist_btn_arrow'></div>
				</div>
				<div class = 'playlist_btn_remove' style= 'display:block'>Remove</div>
			</div`

			// let html = 
			// `<div class='playlist_video_options' style= 'display: block'>
			// 	<div class = 'playlist_btn_remove' style= 'display:block'>Remove</div>
			// </div`
			return html
		};

		function addPlaylistOption(videoDOM) {
			videoDOM.insertAdjacentHTML("beforeend", getPlaylistOptionHTML());
			videoDOM.lastElementChild.lastElementChild.addEventListener("click", function(){deleteDOMVideoInPlayList(videoDOM)});
		};

		function deletePlaylistOption(videoDOM) {
			videoDOM.removeChild(videoDOM.lastElementChild);
		};

		function addAllEventForVideoInPlaylist(videoDOM){
			let permissionToRemoveVideo = userStatus == "MO" ? roomPermissions.moder_can_remove : roomPermissions.guest_can_remove;
			if (permissionToRemoveVideo || userStatus == "HO") {
				videoDOM.addEventListener("mouseenter", function(){addPlaylistOption(videoDOM)});
				videoDOM.addEventListener("mouseleave", function(){deletePlaylistOption(videoDOM)});
			};
		};

		function getNumberVideoInPlaylist(videoDOM) {
			let playlist = document.getElementById("video_list");
			let number = 0;
			for(let i = 0; i < playlist.children.length; i++) {
				number++;
				if(playlist.children[i] === videoDOM) {
					return number;
				};
			};
		};

		function checkPermissions() {
			if (userStatus != "HO") {
				let permissionToAddVideo = userStatus == "MO" ? roomPermissions.moder_can_add : roomPermissions.guest_can_add;
				let permissionToUseChat = userStatus == "MO" ? roomPermissions.moder_can_use_chat : roomPermissions.guest_can_use_chat;
				if (!permissionToAddVideo)
					document.getElementById("search_input").disabled = 1;
				if (!permissionToUseChat)
					document.getElementById("chat_input").disabled = 1;
			};
		};
	};
})();