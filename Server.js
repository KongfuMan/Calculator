var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3001;
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
        let results = recent.get(id);
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

http.listen(port, function(){
  console.log('listening on *:' + port);
});
