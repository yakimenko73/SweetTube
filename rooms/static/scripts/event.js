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
    delete_all_class();
    change_class("btnplaylist", "tab_selected");
    change_class("video_playlist", "tab_visible");
}

document.querySelector('#btnchat').onclick = function() {
    delete_all_class();
    change_class("btnchat", "tab_selected");
    change_class("chat_tab", "tab_visible");
}

document.querySelector('#btnSettings').onclick = function() {
    delete_all_class();
    change_class("btnSettings", "tab_selected");
    change_class("settings_tab", "settings_visible");
}

document.querySelector('')

function change_class(id, style_class) {
    let element_tab = document.getElementById(id);
    element_tab.classList.add(style_class);
}

function delete_class(id, style_class) {
    let element_tab = document.getElementById(id);
    if (element_tab.classList.contains(style_class))
        element_tab.classList.remove(style_class);
}

function delete_all_class() {
    delete_class("btnplaylist", "tab_selected");
    delete_class("video_playlist", "tab_visible");
    delete_class("btnchat", "tab_selected");
    delete_class("chat_tab", "tab_visible");
    delete_class("btnSettings", "tab_selected");
}