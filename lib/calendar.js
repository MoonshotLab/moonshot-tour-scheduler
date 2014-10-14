var Q = require('q');
var moment = require('moment-timezone');
var GoogleCalendar = require('google-calendar');


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
