var express = require('express');
var config = require('./config')();
var passport = require('./lib/auth').passport;
var routes = require('./lib/routes');


var app = express();
app.use(passport.initialize());
var server = require('http').Server(app);

server.listen(config.PORT, function(){
  console.log('server listening on port', config.PORT);
});

app.get('/', passport.authenticate('google', {
  accessType: 'offline',
  approvalPrompt: 'force',
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
}), routes.home);

app.get('/login-error', routes.loginError);

app.get('/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/login-error'}),
  routes.oauth
);

app.get('/partner/:identifier', routes.getNextCalendarEvent);
app.get('/user/:identifier', routes.getNextCalendarEvent);
