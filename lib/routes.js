var auth = require('./auth');
var db = require('./db');
var calendar = require('./calendar');


exports.schedule = function(req, res){
  var scheduler = {};
  if(req.user) scheduler = req.user;

  db.getAllUsers()
    .then(function(users){
      res.render('schedule', {
        users     : users,
        scheduler : scheduler
      });
    })
    .catch(res.send);
};


exports.createEvent = function(req, res){
  calendar.sendInvitation(req.body)
    .then(function(formData){
      res.send(formData);
    })
    .fail(function(err){
      res.statusCode = 500;
      res.send({statusText : JSON.stringify(err)});
      console.log(err);
    });
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


exports.thanks = function(req, res){
  res.render('thanks');
};
