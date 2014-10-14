$(function(){
  var timeStamps = nowAndLater();

  users.forEach(function(user){
    fetchBusyData(
      user.emails[0].value, timeStamps.now, timeStamps.later
    ).then(function(res){
      console.log(res);
    }).fail(function(err){

    });
  });
});


var fetchBusyData = function(userName, timeMin, timeMax){
  var deferred = Q.defer();

  var earl = [
    '/isBusy/',
    userName,
    '?timeMin=',
    timeMin,
    '&timeMax=',
    timeMax,
    '&timeZone=America/Chicago'
  ].join('');

  $.ajax({
    url     : earl,
    success : deferred.resolve,
    error   : deferred.reject
  });

  return deferred.promise;
};


var nowAndLater = function(){
  var now = new Date();
  var later = now.getTime() + 7884000000;

  return {
    now   : now.toISOString(),
    later : new Date(later).toISOString()
  };
};
