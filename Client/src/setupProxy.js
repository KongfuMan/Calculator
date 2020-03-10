const proxy = require('http-proxy-middleware');


const port = process.env.PORT || 3001;
module.exports = function(app) {
    app.use(proxy('/index', { target: 'http://localhost:' + port ,changeOrigin: true}));
};
