var express = require('express');
var path = require('path');
var config = require('./config')();
var passport = require('./lib/auth').passport;
var routes = require('./lib/routes');


var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

var server = require('http').Server(app);

server.listen(config.PORT, function(){
  console.log('server listening on port', config.PORT);
});


app.get('/schedule',
  passport.authenticate('standard', { failureRedirect: '/login-error' }),
  routes.home
);

app.get('/', passport.authenticate('standard', {
  scope: ['email'],
  hd: 'barkleyus.com'
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
