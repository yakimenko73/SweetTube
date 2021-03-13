document.querySelector("body").onload = function() {
    let name = `${Math.random()}`;
    let id = `${Math.random()}`;
    let color = `rgb(${Math.random() * 200}, ${Math.random() * 150}, ${Math.random() * 300}`;
    
    addAllEvents();
    updateUser(name, id, color);
    loadButtons();
    

};

function addAllEvents() {
    setEventForCheckbox();

    document.querySelector('#chat_input').onkeyup = function(e) {
        if (e.keyCode === 13) { // enter, return
            const messageInputDom = document.querySelector('#chat_input');
            const message = messageInputDom.value;
            messageInputDom.value = '';
    
            addMessage(message);
        }
    };
    // increase in users
    
    window.addEventListener("resize", event => {

        if(window.matchMedia("(max-width:992px)").matches)
            addButtons("center");
        else
        {
            addButtons("header");
        }    
            
    })
    
    document.querySelector('#btnCloseOverlay').onclick = function() {
        clickCloseSettings();
    };
    
    document.querySelector('#overlay').onclick = function() {
        clickCloseSettings();
    };

    document.querySelector('#color_picker').onclick = function() {
        if(colorPickerIsVisible())
            deleteClass("color_picker_popup", "color_picker_popup_visible");
        else
            changeClass("color_picker_popup", "color_picker_popup_visible");
    };
}

function setEventClickPlaylist() {
    document.querySelector('#btnplaylist').onclick = function() {
        clickPlaylist();
    };
}

function setEventClickChat() {
    document.querySelector('#btnchat').onclick = function() {
        clickChat();
    };
}

function setEventClickSettings() {
    document.querySelector('#btnSettings').onclick = function() {
        clickSettings();
    };
}

function setEventForCheckbox() {
    // g - guest, m - moderator, o - owner
    let list_roles = [ "g", "m", "o" ];
    let list_type_checkbox = [ "add", "remove", "move", "play", "seek", "skip", "chat", "kick" ];

    for(let role = 0; role < list_roles.length; role++) {
        for(let type = 0; type < list_type_checkbox.length; type++) {
            let id_checkbox = `${list_roles[role]}_${list_type_checkbox[type]}`;

            document.querySelector(`#${id_checkbox}`).onclick = function() {
                changeCheckbox(id_checkbox);
            };
        }
    }

    document.querySelector("#cb_p").onclick = function() {
        changeCheckbox("cb_p");
    };

    document.querySelector("#cb_rn").onclick = function() {
        changeCheckbox("cb_rn");
    };

}

function changeClass(id, style_class) {
    let element_tab = document.getElementById(id);
    element_tab.classList.add(style_class);
}

function deleteClass(id, style_class) {
    let element_tab = document.getElementById(id);
    if (element_tab.classList.contains(style_class))
        element_tab.classList.remove(style_class);
}

function clickCloseSettings() {
    deleteClass("overlay", "overlay_visible");
    deleteClass("settings_tab", "settings_visible");
}

function clickSettings() {
    changeClass("overlay", "overlay_visible");
    changeClass("settings_tab", "settings_visible");
}

function clickPlaylist() {
    delete_all_class_for_panel();
    changeClass("btnplaylist", "tab_selected");
    changeClass("video_playlist", "tab_visible");
}

function clickChat() {
    delete_all_class_for_panel();
    changeClass("btnchat", "tab_selected");
    changeClass("chat_tab", "tab_visible");
}

function delete_all_class_for_panel() {
    deleteClass("btnplaylist", "tab_selected");
    deleteClass("video_playlist", "tab_visible");
    deleteClass("btnchat", "tab_selected");
    deleteClass("chat_tab", "tab_visible");
    deleteClass("btnSettings", "tab_selected");
}

// add user

function setColorForUserList(id, color) {
    let panel_user = document.getElementById(id);
    panel_user.style = `border-right: 5px solid ${color}`;
}

function updateUser(name, id, color, isAdd = true) {
    if(!isAdd) {
        document.getElementById(id).remove();
        updateCounterUser(isAdd);
        return;
    }
    
    let user_list = document.getElementById("user_list");
    let panel_user = document.createElement("li");
    let user_name = document.createElement("div");
    
    panel_user.appendChild(user_name);
    user_list.appendChild(panel_user);

    panel_user.id = id;
    setColorForUserList(panel_user.id, color);
    changeClass(panel_user.id, "user");

    user_name.id = `${id}_name`;
    user_name.style = "font-weight: bold;";
    user_name.textContent = name;
    changeClass(user_name.id, "name");

    updateCounterUser(isAdd);
}

// counter of users
function updateCounterUser(isAdd = true, count = 1) {
    if(!isAdd)
        count *= -1

    let user_counter = document.getElementById("user-counter");
    let old_counter = Number(user_counter.textContent);
    let new_counter = old_counter + count;
    
    if (new_counter < 0)
        new_counter = 0;
    user_counter.textContent = new_counter;
}

// add message in chat 

// color and mailer = null -> system message
function addMessage(message, color_for_username = null, mailer = null) {
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
        let span = makeSpan(style, text);
        new_message.appendChild(span);
    }

    chat_log.appendChild(new_message);
    chat_log.scrollTop = chat_log.scrollHeight;
}

function makeSpan(style, text) {
    let span = document.createElement("span");
    span.style = style;
    span.textContent = text;
    return span;
}

function isChecked(id_checkbox) {
    let checkbox = document.getElementById(id_checkbox);
    if(checkbox.classList.contains("checked"))
        return true;
    return false;
}

function colorPickerIsVisible() {
    let checkbox = document.getElementById("color_picker_popup");

    if(checkbox.classList.contains("color_picker_popup_visible"))
        return true;
    return false;
}   

function changeCheckbox(id_checkbox, checked = null) {
    if (checked != null)
    {
        if(checked)
            changeClass(id_checkbox, "checked");
        else
            deleteClass(id_checkbox, "checked");
        
        return;
    }
    
    if(isChecked(id_checkbox))
        deleteClass(id_checkbox, "checked");
    else
        changeClass(id_checkbox, "checked");
}

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
}

function buttonsExists(id_parent_element) {
    if (document.getElementById("main_nav").parentElement.id == id_parent_element)
        return true;
    return false; 
}

function loadButtons() {
    let width = document.documentElement.clientWidth;
    if (width > 928)
        addButtons("header");
    else
        addButtons("center");
}