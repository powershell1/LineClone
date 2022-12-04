// Prototype function \\
Element.prototype.insertChildAtIndex = function(child, index) {
    if (!index) index = 0;
    if (index === true) {
        this.appendChild(child);
    } else if (index >= this.children.length) {
        this.appendChild(child);
    } else {
        this.insertBefore(child, this.children[index]);
    };
};




// Main Script \\
var LoadingText = document.getElementById("LoadingText");

var host = document.location.host;
var protocal = document.location.href.split("://")[0];
var towsp = protocal == "https" ? "wss://" : "ws://";
var websocket = new WebSocket(`${towsp}${host}/ws`);
var loadingdot = 2;

var name_inp = "default";
var ping_interval;

LoadingText.innerText = "Loading.";
var LoadingInterval = setInterval(() => {
    var Contac = "";
    for (var i = 0; i < loadingdot; i++) { Contac += "." };
    LoadingText.innerText = "Loading" + Contac;
    loadingdot++;
    if (loadingdot >= 4) {
        loadingdot = 1;
    };
}, 1000);

function GetDownloadName(link) {
    var link_split = link.split("/get_upload/");
    var name = link_split[link_split.length - 1];
    return name;
};

function FileToLongName(file_name) {
    var length = 15;
    if (file_name.length > length) {
        var long_name = file_name.split(".");
        var long_name = long_name[0].slice(0, Math.floor(length / 3)) + "..." + long_name[0].slice(Math.floor(length / 1.25), file_name.length) + "." + long_name[1];
        return long_name;
    } else {
        return file_name;
    };
};

function AddText(pos, sender, body) {
    return new Promise((resolve, reject) => {
        var chat = document.getElementById("chat_msgshow");
        var chat_div = document.createElement("div");
        var chat_a = document.createElement("a");
        var chat_a2 = document.createElement("a");
        chat_a.innerText = `${sender}`;
        chat_a.className = "chat_text";
        chat_a2.innerText = `: ${body}`;
        chat_a2.className = "chat_text";
        chat_div.appendChild(chat_a);
        chat_div.appendChild(chat_a2);
        chat.insertChildAtIndex(chat_div, pos);
    });
};

function AddFile(pos, sender, url, mineType, filesize) {
    return new Promise((resolve, reject) => {
        var filetype = mineTypeCheck(mineType);
        if (filetype == "image") {
            var chat = document.getElementById("chat_msgshow");
            var chat_div = document.createElement("div");
            var chat_a = document.createElement("a");
            var chat_img = document.createElement("img");
            chat_a.innerText = `${sender}: `;
            chat_a.className = "chat_text";
            chat_img.src = url;
            chat_img.className = "chat_img";
            chat_div.appendChild(chat_a);
            chat_div.appendChild(chat_img);
            chat.insertChildAtIndex(chat_div, pos);
            resolve();
        } else if (filetype == "audio") {
            var chat = document.getElementById("chat_msgshow");
            var chat_div = document.createElement("div");
            var chat_a = document.createElement("a");
            var chat_audio = document.createElement("audio");
            var chat_source = document.createElement("source");
            chat_a.innerText = `${sender}: `;
            chat_a.className = "chat_text";
            chat_audio.controls = true;
            chat_audio.autoplay = true;
            chat_audio.className = "chat_audio";
            chat_source.src = url;
            chat_source.type = mineType;
            chat_div.appendChild(chat_a);
            chat_div.appendChild(chat_audio);
            chat_audio.appendChild(chat_source);
            chat.insertChildAtIndex(chat_div, pos);
            resolve();
        } else if (filetype == "video") {
            var chat = document.getElementById("chat_msgshow");
            var chat_div = document.createElement("div");
            var chat_a = document.createElement("a");
            var chat_video = document.createElement("video");
            var chat_source = document.createElement("source");
            chat_a.innerText = `${sender}: `;
            chat_a.className = "chat_text";
            chat_video.controls = true;
            chat_video.autoplay = true;
            chat_video.className = "chat_video";
            chat_source.src = url;
            chat_source.type = mineType;
            chat_div.appendChild(chat_a);
            chat_div.appendChild(chat_video);
            chat_video.appendChild(chat_source);
            chat.insertChildAtIndex(chat_div, pos);
            resolve();
        } else {
            var download_link = GetDownloadName(url)
            var chat = document.getElementById("chat_msgshow");
            var chat_div = document.createElement("div");
            var chat_a = document.createElement("a");
            chat_a.innerText = `${sender}: `;
            chat_a.className = "chat_text";
            var chat_div2 = document.createElement("div");
            chat_div2.className = "chat_download";
            var chat_a2 = document.createElement("a");
            chat_a2.className = "name";
            chat_a2.href = `/download/${download_link}`;
            chat_a2.innerText = FileToLongName(download_link);
            var chat_a3 = document.createElement("a");
            chat_a3.className = "size";
            chat_a3.innerText = filesize.toFixed(2) + "MB";
            var chat_img = document.createElement("img");
            chat_img.src = "/public/download.png";
            chat_img.className = "file_download";
            chat_img.addEventListener("click", () => {
                window.open(`/download/${download_link}`, "_blank");
            });
            chat_div.appendChild(chat_a);
            chat_div.appendChild(chat_div2);
            chat_div2.appendChild(chat_a2);
            chat_div2.appendChild(chat_a3);
            chat_div2.appendChild(chat_img);
            chat.insertChildAtIndex(chat_div, pos);
            resolve();
        };
    });
};

function mineTypeCheck(file) {
    var file_type = file.split("/");
    return file_type[0];
};

function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified,
    });
}

websocket.addEventListener("close", () => {
    alert("[Warning] Connection to server lost!");
    clearInterval(ping_interval);
});

websocket.addEventListener("message", async (event) => {
    var data = JSON.parse(event.data);
    if (data.type == "message") {
        await AddText(true, data.name, data.text);
    } else if (data.type == "file") {
        await AddFile(true, data.name, data.url, data.file_type, (data.file_size / 1024));
    } else if (data.type == "chat_history") {
        var chatHistory = JSON.parse(data.body);
        clearInterval(LoadingInterval);
        document.getElementById("LoadingDIV").remove();
        document.getElementById("enter_name").style = "";
        chatHistory.history.forEach(async (element2, idx2) => {
            if (element2.text) {
                await AddText(idx2, element2.name, element2.text);
            } else if (element2.url) {
                var fetch_content = await fetch(element2.url)
                await AddFile(idx2, element2.name, element2.url, fetch_content.headers.get("Content-Type"), (parseInt(fetch_content.headers.get("Content-Length"), 10) / 1024));
            };
        });
    };
});

document.getElementById("name_btn").addEventListener("click", () => {
    var yes_prompt = false;
    if (document.getElementById("name_input").value.length > 0) {
        yes_prompt = true;
    } else {
        yes_prompt = confirm("Are you sure you want to be anonymous?");
    };
    if (yes_prompt) {
        name_inp = document.getElementById("name_input").value;
        document.getElementById("enter_name").remove();
        document.getElementById("chat").style = "";
    };
});

document.getElementById("file_upload").addEventListener("click", () => {
    var new_file = document.createElement("input");
    new_file.type = "file";
    new_file.onchange = () => {
        var files = Array.from(new_file.files);
        new_file.remove();
        files.forEach(file => {
            var formData = new FormData();
            var newfile_name = btoa(encodeURIComponent(file.name));
            formData.append("files", renameFile(file, newfile_name));
            fetch("/upload", {
                method: "POST",
                headers: {
                    "name": name_inp,
                    "file_name": newfile_name
                },
                body: formData
            });
        });
    };
    new_file.click();
});

document.addEventListener("keypress", (key) => {
    if (key.key == "Enter" && !key.shiftKey) {
        var chat_msg = document.getElementById("chat_msg");
        if (chat_msg.value.length > 0) {
            chat_msg.blur();
            websocket.send(JSON.stringify({
                "type": "message",
                "name": name_inp,
                "body": chat_msg.value
            }));
            chat_msg.value = "";
        };
    };
});

ping_interval = setInterval(() => {
    websocket.send(JSON.stringify({
        type: "ping"
    }));
}, 1000);