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
    var errorMessage;
    try{ errorMessage = String(err); }
    catch(error) { }
    res.send(errorMessage);
  };

  db.findUser(req.params.email)
    .then(auth.getNewAccessToken)
    .then(calendar.getNextEvent)
    .then(handleResponse)
    .catch(handleError);
};
