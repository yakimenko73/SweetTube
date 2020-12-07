// window.onload = function () {
// 	function readCookie(name) {
// 		var nameEQ = name + "=";
// 		var ca = document.cookie.split(';');
// 		for(var i=0;i < ca.length;i++) {
// 			var c = ca[i];
// 			while (c.charAt(0)==' ') c = c.substring(1,c.length);
// 			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
// 		}
// 		return null;
// 	}

// 	var a = document.getElementById('create-room');
// 	var csrftoken = readCookie('csrftoken');

// 	state = {
// 			moder_can_add: true, 
// 			moder_can_remove: true,
// 			moder_can_move: true, 
// 			moder_can_playpause: true,
// 			moder_can_seek: true,
// 			moder_can_skip: true,
// 			moder_can_use_chat: true,
// 			moder_can_kick: true, 
// 			guest_can_add: true, 
// 			guest_can_remove: true, 
// 			guest_can_move: true, 
// 			guest_can_playpause: true, 
// 			guest_can_seek: true, 
// 			guest_can_skip: true, 
// 			guest_can_use_chat: true, 
// 			guest_can_kick: true
// 	};

// 	a.onclick = function () {
// 		alert(csrftoken);
// 		this.$http.post(server, {params: {
// 			"moder_can_add": true, 
// 			"moder_can_remove": true,
// 			"moder_can_move": true, 
// 			"moder_can_playpause": true,
// 			"moder_can_seek": true,
// 			"moder_can_skip": true,
// 			"moder_can_use_chat": true,
// 			"moder_can_kick": true, 
// 			"guest_can_add": true, 
// 			"guest_can_remove": true, 
// 			"guest_can_move": true, 
// 			"guest_can_playpause": true, 
// 			"guest_can_seek": true, 
// 			"guest_can_skip": true, 
// 			"guest_can_use_chat": true, 
// 			"guest_can_kick": true
// 	}}, {headers: {"X-CSRFToken": 'o38a285dzu4xz2lvx0sda4i70j6o3wz6' }})
// 		.then(function (response) {
//             this.response = response.data;
//         },
//         function (response) {
//             alert(""+response);
//         });
// 	}
// }