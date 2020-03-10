const proxy = require('http-proxy-middleware');


const production  = 'https://thawing-castle-87375.herokuapp.com';
const development = 'http://localhost:3000/';
const url = (process.env.NODE_ENV ? production : development);
const port = (process.env.PORT || 5000);
module.exports = function(app) {
    app.use(proxy('/index', { target: url + port ,changeOrigin: true, secure:false}));
};
