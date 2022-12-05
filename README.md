# WebChat
### Q&A
Q: Pont of this?<br />
A: Point of this project is web chat but anything you send will store for a lifetime until the world end, the server shutdown<br />
Q: Why should I use this?<br />
A: This webchat won't automatically delete files or upload limit ( I use free hosting the size limit of the server is 1GB )<br />
### How to use it?
You can download this project and run `node index.js` the server will start and you can visit `localhost` or you can visit this website https://webchat.powershell1.repl.co/<br />
#### ⚠️ Make sure you didn't run any server on port 80 ⚠️
#### ⚠️ If you want to chat with friends with self-hosting you need to use `Hamachi, Radmin VPN` ⚠️
### How do I create?
I create this by `express, express-ws and uuid` ( Example is minimizing version no file upload ), to create a server first we need to require express and open it to port 80
```javascript
// (Server)
const express = require("express");

const app = express();

// Start server on port 80!
app.listen(80, () => {
  console.log("Server start on port 80!");
});
```
#### Expected log on Server
```
The server started on port 80!
```
after that, I create a WebSocket listener where every time there is a new connection to the server will log, save to SocketList, and create a close listener to prevent memory leak
#### Server
```javascript
const express = require("express");
const expressws = require("express-ws");
const uuid = require("uuid");

const app = express();
expressws(app);

var SocketList = {}

// Add WebSocket listener
app.ws("/chat", (ws, req) => {
  // Create random uuid
  var new_uuid = uuid.v4();
  SocketList[new_uuid] = ws;
  // Log when there is a new connection
  console.log("New socket");
  // Create a close listener to prevent memory leak
  ws.on("close", (msg) => {
    delete SocketList[new_uuid];
  });
});

// Start server on port 80!
app.listen(80, () => {
  console.log("The server started on port 80!");
});
```
#### Client
```javascript
var websocket = new WebSocket(`ws://localhost/chat`);

// make listener if a server were close
websocket.addEventListener("close", () => {
  // alert client that server was close
  alert("[Warning] Lost connection!");
});
```
#### Expected log on Server
```
The server started on port 80!
New socket
```
add on_message listener and send messages to all clients except the sender
#### Server
```javascript
const express = require("express");
const expressws = require("express-ws");
const uuid = require("uuid");

const app = express();
expressws(app);

var SocketList = {}

// Add WebSocket listener
app.ws("/chat", (ws, req) => {
  // Create random uuid
  var new_uuid = uuid.v4();
  SocketList[new_uuid] = ws;
  // Log when a new connection
  console.log("New socket");
  // Create a message listener
  ws.on("message", (msg) => {
    // Loop All Socket
    for (const property in SocketList) {
      // Check If doesn't sender
      if (property != new_uuid) {
        var socket = SocketList[property];
        // Send Message
        socket.send(msg);
      };
    };
  });
  // Create a close listener to prevent memory leak
  ws.on("close", (msg) => {
    delete SocketList[new_uuid];
  });
});

// Start server on port 80!
app.listen(80, () => {
  console.log("The server started on port 80!");
});
```
#### Client ( One sends, Other receives)
```javascript
var websocket = new WebSocket(`ws://localhost/chat`);

var wannabe_sender = confirm("Do you want to be sender?");

// make listener if a server were close
websocket.addEventListener("close", () => {
  // alert client that server was close
  alert("[Warning] Lost connection!");
});

// make listener message were send
websocket.addEventListener("message", (event) => {
  // alert message
  alert(event.data);
});

// If the client wants to be the sender
if (wannabe_sender) {
  // Loop sends every 0.1 second
  setInterval(() => {
    var message_wanna_send = prompt("Want message you want to send?");
    websocket.send(message_wanna_send);
  }, 100);
};
```
#### Expected on the sender
![](https://github.com/powershell1/WebChat/blob/master/github_image/Sender.png?raw=true)
#### Expected on receiver
![](https://github.com/powershell1/WebChat/blob/master/github_image/Receiver.png?raw=true)
#### Expected log on Server
```
The server started on port 80!
New socket
New socket
```
