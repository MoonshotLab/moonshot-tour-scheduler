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


app.get('/', routes.home);

app.get('/auth', passport.authenticate('google', {
  accessType: 'offline',
  approvalPrompt: 'force',
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
}), routes.loginError);

app.get('/login-error', routes.loginError);

app.get('/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/login-error' }),
  routes.oauth
);

app.get('/users', routes.users);
app.get('/isBusy/:email', routes.isBusy);
