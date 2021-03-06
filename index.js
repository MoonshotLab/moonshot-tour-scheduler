var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config')();
var passport = require('./lib/auth').passport;
var routes = require('./lib/routes');


var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
  secret : config.SESSION_SECRET,
  saveUninitialized : true,
  resave : true
}));

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').Server(app);

server.listen(config.PORT, function(){
  console.log('server listening on port', config.PORT);
});


if(config.ROOT_URL == 'http://localhost:3000')
  app.get('/', routes.schedule);

app.get('/schedule',
  passport.authenticate('standard', { failureRedirect: '/login-error' }),
  routes.schedule
);

app.get('/thanks', routes.thanks);

app.post('/create-event',
  passport.session('session'),
  routes.createEvent
);

app.get('/', passport.authenticate('standard', {
  scope: ['email']
}), routes.loginError);

app.get('/auth', passport.authenticate('lab', {
  accessType: 'offline',
  approvalPrompt: 'force',
  hd: 'barkleyus.com',
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
}), routes.loginError);

app.get('/login-error', routes.loginError);

app.get('/oauth2callback',
  passport.authenticate('lab', { failureRedirect: '/login-error' }),
  routes.authenticated
);

app.get('/users', routes.users);
app.get('/isBusy/:email', routes.isBusy);
