var userMap = require('../config/userMap');
var auth = require('./auth');
var db = require('./db');
var calendar = require('./calendar');


// If this gets displayed, we know the login
// somehow got messed up
exports.home = function(req, res){
  res.send('failure to complete oauth');
};


exports.loginError = function(req, res){
  res.send('login failed');
};


exports.oauth = function(req, res){
  res.send('authenticated');
};


exports.getNextCalendarEvent = function(req, res){
  var handleResponse = function(calendarEvent){

    var resObj = {};
    var numKeys = 0;

    for(var key in req.query){
      resObj[key] = calendarEvent[key];
      numKeys++;
    }

    if(numKeys === 0) resObj = calendarEvent;

    res.send(resObj);
  };


  var handleError = function(err){
    var errorMessage = 'Some unknown error occured';
    try{ errorMessage = String(err); }
    catch(error) { }

    res.send(errorMessage);
  };


  var selectedUser = null;
  userMap.users.forEach(function(user){
    if(user.sparkId == req.params.identifier|| user.email == req.params.identifier)
      selectedUser = user;
  });

  if(selectedUser){
    db.findUser(selectedUser)
      .then(auth.getNewAccessToken)
      .then(calendar.getNextEvent)
      .then(handleResponse)
      .catch(handleError);
  } else{
    res.send({
      error: 'No user with matching button id. Check out the list below',
      users: userMap.users
    });
  }
};
