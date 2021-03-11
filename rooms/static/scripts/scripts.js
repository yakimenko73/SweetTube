document.querySelector("body").onload = function() {
    let name = `${Math.random()}`;
    let id = `${Math.random()}`;
    let color = `rgb(${Math.random() * 200}, ${Math.random() * 150}, ${Math.random() * 300}`;
    
    add_all_events();
    update_user(name, id, color);
    

};

function add_all_events() {
    set_event_for_checkbox();

    document.querySelector('#chat_input').onkeyup = function(e) {
        if (e.keyCode === 13) { // enter, return
            const messageInputDom = document.querySelector('#chat_input');
            const message = messageInputDom.value;
            messageInputDom.value = '';
    
            add_message(message);
        }
    };
    // increase in users
    
    document.querySelector('#btnplaylist').onclick = function() {
        click_playlist();
    };
    
    document.querySelector('#btnchat').onclick = function() {
        click_chat();
    };
    
    document.querySelector('#btnSettings').onclick = function() {
        click_settings();
    };
    
    document.querySelector('#btnCloseOverlay').onclick = function() {
        click_close_settings();
    };
    
    document.querySelector('#overlay').onclick = function() {
        click_close_settings();
    };

    document.querySelector('#pick_u_color').onclick = function() {
        if(color_picker_is_visible())
            delete_class("color_picker_popup", "color_picker_popup_visible");
        else
            change_class("color_picker_popup", "color_picker_popup_visible");
    };

    
}


function set_event_for_checkbox() {
    // g - guest, m - moderator, o - owner
    let list_roles = [ "g", "m", "o" ];
    let list_type_checkbox = [ "add", "remove", "move", "play", "seek", "skip", "chat", "kick" ];

    for(let role = 0; role < list_roles.length; role++) {
        for(let type = 0; type < list_type_checkbox.length; type++) {
            let id_checkbox = `${list_roles[role]}_${list_type_checkbox[type]}`;

            document.querySelector(`#${id_checkbox}`).onclick = function() {
                change_checkbox(id_checkbox);
            };
        }
    }

    document.querySelector("#cb_p").onclick = function() {
        change_checkbox("cb_p");
    };

    document.querySelector("#cb_rn").onclick = function() {
        change_checkbox("cb_rn");
    };

}

function change_class(id, style_class) {
    let element_tab = document.getElementById(id);
    element_tab.classList.add(style_class);
};

function delete_class(id, style_class) {
    let element_tab = document.getElementById(id);
    if (element_tab.classList.contains(style_class))
        element_tab.classList.remove(style_class);
}

function click_close_settings() {
    delete_class("overlay", "overlay_visible");
    delete_class("settings_tab", "settings_visible");
}

function click_settings() {
    change_class("overlay", "overlay_visible");
    change_class("settings_tab", "settings_visible");
}

function click_playlist() {
    delete_all_class_for_panel();
    change_class("btnplaylist", "tab_selected");
    change_class("video_playlist", "tab_visible");
}

function click_chat() {
    delete_all_class_for_panel();
    change_class("btnchat", "tab_selected");
    change_class("chat_tab", "tab_visible");
}

function delete_all_class_for_panel() {
    delete_class("btnplaylist", "tab_selected");
    delete_class("video_playlist", "tab_visible");
    delete_class("btnchat", "tab_selected");
    delete_class("chat_tab", "tab_visible");
    delete_class("btnSettings", "tab_selected");
}

// add user

function set_color_for_user_list(id, color) {
    let panel_user = document.getElementById(id);
    panel_user.style = `border-right: 5px solid ${color}`;
}

function update_user(name, id, color, isAdd = true) {
    if(!isAdd) {
        document.getElementById(id).remove();
        update_counter_user(isAdd);
        return;
    }
    
    let user_list = document.getElementById("user_list");
    let panel_user = document.createElement("li");
    let user_name = document.createElement("div");
    
    panel_user.appendChild(user_name);
    user_list.appendChild(panel_user);

    panel_user.id = id;
    set_color_for_user_list(panel_user.id, color);
    change_class(panel_user.id, "user");

    user_name.id = `${id}_name`;
    user_name.style = "font-weight: bold;";
    user_name.textContent = name;
    change_class(user_name.id, "name");

    update_counter_user(isAdd);
}

// counter of users
function update_counter_user(isAdd = true, count = 1) {
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
    chat_log.scrollTop = chat_log.scrollHeight;
}

function make_span(style, text) {
    let span = document.createElement("span");
    span.style = style;
    span.textContent = text;
    return span;
}

function is_checked(id_checkbox) {
    let checkbox = document.getElementById(id_checkbox);
    if(checkbox.classList.contains("checked"))
        return true;
    return false;
}

function color_picker_is_visible() {
    let checkbox = document.getElementById("color_picker_popup");

    if(checkbox.classList.contains("color_picker_popup_visible"))
        return true;
    return false;
}   

function change_checkbox(id_checkbox, checked = null) {
    if (checked != null)
    {
        if(checked)
            change_class(id_checkbox, "checked");
        else
            delete_class(id_checkbox, "checked");
        
        return;
    }
    
    if(is_checked(id_checkbox))
        delete_class(id_checkbox, "checked");
    else
        change_class(id_checkbox, "checked");
}