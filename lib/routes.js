var auth = require('./auth');
var db = require('./db');
var calendar = require('./calendar');


exports.home = function(req, res){
  db.getAllUsers()
    .then(function(users){
      res.render('schedule', { users : users });
    })
    .catch(res.send);
};


exports.loginError = function(req, res){
  res.send('login failed');
};


exports.authenticated = function(req, res){
  res.send({ status: 'authenticated' });
};


exports.users = function(req, res){
  db.getAllUsers()
    .then(function(users){
      res.send(users);
    })
    .catch(res.send);
};


exports.isBusy = function(req, res){
  db.findUser(req.params.email)
    .then(auth.getNewAccessToken)
    .then(function(user){
      calendar.isBusy(user, req.query)
        .then(function(isBusy){
          res.send(isBusy);
        })
        .catch(handleError);
    })
    .catch(res.send);
};
