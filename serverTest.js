
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: { origin: "*" }
});
//D:\benny\socket.io\mongo_chatApp commonDB\serverTest.js
app.get('/', function (req, res) {
    res.send("api");
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('msg', (msg) => {
      console.log(msg);
    
      console.log(socket.id);
      

      socket.broadcast.emit("msg", socket.id);
    })
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});