var auth = require('./auth');
var db = require('./db');
var calendar = require('./calendar');


exports.home = function(req, res){
  res.sendfile('public/index.html');
};


exports.loginError = function(req, res){
  res.send('login failed');
};


exports.oauth = function(req, res){
  res.send({ status: 'authenticated' });
};


exports.isBusy = function(req, res){
  var handleResponse = function(isBusy){
    res.send(isBusy);
  };

  var handleError = function(err){
    var errorMessage;
    try{ errorMessage = String(err); }
    catch(error) { }
    res.send(errorMessage);
  };

  db.findUser(req.params.email)
    .then(auth.getNewAccessToken)
    .then(function(user){
      calendar.isBusy(user, req.query)
        .then(handleResponse)
        .catch(handleError);
    })
    .catch(handleError);
};
