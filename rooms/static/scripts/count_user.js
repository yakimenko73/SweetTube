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