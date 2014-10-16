var Q = require('q');
var GoogleCalendar = require('google-calendar');
var db = require('./db');


exports.isBusy = function(user, params){
  var deferred = Q.defer();

  var gcal = new GoogleCalendar.GoogleCalendar(user.accessToken);

  // translate the user emails to id vals
  params.items = [];
  user.emails.forEach(function(email){
    params.items.push({ id : email.value });
  });

  gcal.freebusy.query(
    params,
    function(err, res){
      if(err) deferred.reject(err);
      else deferred.resolve(res);
    }
  );

  return deferred.promise;
};


exports.sendInvitation = function(eventParams){
  var deferred = Q.defer();

  // Todo - Change the owner to Mark Logan
  db.findUser('jlongstreet@barkleyus.com')
    .then(function(user){
      var gcal = new GoogleCalendar.GoogleCalendar(user.accessToken);
      var calendarId = user.emails[0].value;

      gcal.events.insert(
        calendarId, eventParams, { sendNotifications : true }, function(err, res){
          if(err) deferred.reject(err);
          else deferred.resolve(eventParams);
        }
      );
    });

  return deferred.promise;
};
