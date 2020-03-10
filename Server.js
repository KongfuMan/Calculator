var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = (process.env.PORT || 5000);
var cookieParser = require('cookie-parser');
var session = require("express-session")({
        secret: "my-secret",
        resave: true,
        saveUninitialized: true
    });

sharedsession = require("express-socket.io-session");
app.use(session);
app.use(cookieParser());

var recent = new Map(); // store session id : most recent 10;


app.get('/index', function(req, res){
    var session = req.cookies.sessionID; // get
    if (!session) {
        // no: set a new cookie
        var randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2,randomNumber.length);
        res.cookie('sessionID',randomNumber, { maxAge: 90000000, httpOnly: true });
    }
    else {
        console.log('cookie exists', session);
    }
    if (!recent.get(session)){
        recent.set(session, []);
    }
    console.log("recent.get(session)",recent.get(session));
    res.json({formulas:recent.get(session)});
});

io.use(sharedsession(session));
io.on('connection', function(socket){
    const id =  socket.handshake.cookies.sessionID;
    socket.on('calculate', function(msg){
        let res;
        const num1 = parseInt(msg.m);
        const num2 = parseInt(msg.n);
        switch (msg.p){
            case '+' : res = num1 + num2; break;
            case '-' : res = num1 - num2; break;
            case '*' : res = num1 * num2; break;
            case '/' : res = num1 / num2; break;
        }
        const formula = (msg.m + ' ' + msg.p + ' ' + msg.n + ' ' + '=' + ' ' + res);
        let results = recent.get(id) || [];
        if (results.length < 10){
            results.push(formula);
        }else{
            results.push(formula);
            results = results.slice(1, results.length);
        }
        recent.set(id,results);
        io.emit('calculate', formula);
    });
});

if (process.env.NODE_ENV === 'production'){
    //Express will serve up production assets
    //like our main.js and main.css file
    app.use(express.static('client/build'));

    //Express will serve up the index.html file
    //if it does not recognize the route
    const path = require('path');
    app.get('*', (req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'));
    });
}

http.listen(port, function(){
  console.log('listening on *:' + port);
});
