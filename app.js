var http = require("http");
var express = require("express");
var path = require("path");
var static = require("serve-static");
var socketio = require("socket.io")
var cors = require("cors");
var app = express();



app.use(cors());
app.use('/public',static(path.join(__dirname,"public")));

app.get('/', function(req,res){
    res.end('Hello NodeJS socket server');
})
//서버생성과 연결
var server = http.createServer(app).listen(3000,function(){
    console.log('server is operating http://localhost:3000');
})

var sendResponse = function(socket , recepient, message){
    console.log("sendR"+message);
    socket.emit('response', { recepient: recepient, message : message});
}

//{key:value, key:value} 접속자의 socket정보
var login_ids = {};

//메세지 받을때 on    socket정보를 받는다.
//평소에는 대기상태 - 요청이 오면 작동함
var io = socketio.listen(server);
io.sockets.on('connection', function(socket){
    console.log('서버의 소켓접속정보 ---> ', socket.request.connection._peername);
    
    socket.on('message', function(message){
        console.log('server side >> ', message);
        console.log(login_ids[message.recepient]);
        console.log(login_ids);
        //메세지 보낼때
        if(message.recepient =='All'){
            socket.emit("message", message)
        } else if(login_ids[message.recepient]){
            var socket_id = login_ids[message.recepient];
            io.sockets.connected[socket_id].emit('message', message);
            //메세지 보낼때 나오는 정보들
            sendResponse(socket,message.sender, message.data);
        } else{
            sendResponse(socket, '상대방 socket이 러그아웃되었습니다.')
        }
    })
    //로그인정보 받기
    socket.on('login', function(user){
        console.log('login 이벤트를 받았다.')
        console.log('접속한 로그인 id :' +user.id);
        console.dir(user);
    
        //user.id와 socket.id를 맵핑 시킨다. 해당 user의 socket이 없다면 등록.
        login_ids[user.id] = socket.id;
        socket.user_id = user.id;
        console.log(login_ids[user.id]);
        console.log('현재 접속 id 는 %d개이다.', Object.keys(login_ids).length);
        //로그인했을때 메세지창에 나오는 정보들
        sendResponse(socket, user.id,'로그인 되었습니다')
    });

})



