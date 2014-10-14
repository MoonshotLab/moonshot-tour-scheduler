var express = require('express');
var passport = require('./lib/auth').passport;
var routes = require('./lib/routes');
var PORT = process.env.PORT || 3000;


var app = express();
app.use(passport.initialize());
var server = require('http').Server(app);

server.listen(PORT, function(){
  console.log('server listening on port', PORT);
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
