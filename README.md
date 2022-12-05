# WebChat
### Objective?
### How to use it?
You can download this project and run ```node index.js``` the server will start and you can visit ```localhost``` or you can visit this website https://websitechat.powershell1.repl.co/<br />
#### ⚠️ Make sure you didn't run any server on port 80 ⚠️
### How do I create?
I create this by ```express framework, express-ws, express-fileupload, fs, path, and uuid```, to create a server first we need to require express and open it to port 80 
```javascript
// (Server)
const express = require("express");

const app = express();

// Start server on port 80!
app.listen(80, () => {
  console.log("Server start on port 80!");
});
```
after that, I create a WebSocket listener where every time there is a new connection to the server will log
#### Client
```javascript
var websocket = new WebSocket(`localhost/ws`);

var ping_interval;

// make listener if a server were close
websocket.addEventListener("close", () => {
  // alert client that server was close
  alert("[Warning] Lost connection!");
  // stop a client from ping
  clearInterval(ping_interval);
});

// make ping every 1 second to keep client open
ping_interval = setInterval(() => {
  websocket.send(JSON.stringify({
    type: "ping"
  }));
}, 1000);
```
#### Server
```javascript
const express = require("express");
const expressws = require("express-ws");

const app = express();
expressws(app);

// Add WebSocket listener
app.ws("/chat", (ws, req) => {
  // Log when new connection
  console.log("New socket");
});

// Start server on port 80!
app.listen(80, () => {
  console.log("The server started on port 80!");
});
```
#### Expected log
```
The server started on port 80!
New socket
```
