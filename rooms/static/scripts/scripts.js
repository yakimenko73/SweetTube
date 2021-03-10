document.querySelector('#chat_input').onkeyup = function(e) {
    if (e.keyCode === 13) { // enter, return
        const messageInputDom = document.querySelector('#chat_input');
        const message = messageInputDom.value;
        messageInputDom.value = '';

        add_message(message);
    }
};

document.querySelector('#user-counter').onclick = function() {
    update_user();
}

document.querySelector('#btnplaylist').onclick = function() {
    delete_all_class_for_panel();
    change_class("btnplaylist", "tab_selected");
    change_class("video_playlist", "tab_visible");
}

document.querySelector('#btnchat').onclick = function() {
    delete_all_class_for_panel();
    change_class("btnchat", "tab_selected");
    change_class("chat_tab", "tab_visible");
}

document.querySelector('#btnSettings').onclick = function() {
    delete_all_class_for_panel();
    change_class("overlay", "overlay_visible");
    change_class("btnSettings", "tab_selected");
    change_class("settings_tab", "settings_visible");
}

document.querySelector('#btnCloseOverlay').onclick = function() {
    delete_class("overlay", "overlay_visible");
    delete_class("settings_tab", "settings_visible");
}


function change_class(id, style_class) {
    let element_tab = document.getElementById(id);
    element_tab.classList.add(style_class);
}

function delete_class(id, style_class) {
    let element_tab = document.getElementById(id);
    if (element_tab.classList.contains(style_class))
        element_tab.classList.remove(style_class);
}

function delete_all_class_for_panel() {
    delete_class("btnplaylist", "tab_selected");
    delete_class("video_playlist", "tab_visible");
    delete_class("btnchat", "tab_selected");
    delete_class("chat_tab", "tab_visible");
    delete_class("btnSettings", "tab_selected");
}

// count_user

function update_user(isAdd = true, count = 1) {
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