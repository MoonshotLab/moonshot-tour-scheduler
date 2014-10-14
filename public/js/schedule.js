$(function(){
  var timeStamps = nowAndLater();

  users.forEach(function(user){
    fetchUser(
      user.emails[0].value, timeStamps.now, timeStamps.later
    );
  });
});


var fetchUser = function(userName, timeMin, timeMax){
  var earl = [
    '/isBusy/',
    userName,
    '?timeMin=',
    timeMin,
    '&timeMax=',
    timeMax
  ].join('');

  $.ajax({
    url: earl,
    success: function(data){
      console.log(data);
    }, error: function(err){
      console.log(err);
    }
  });
};


var nowAndLater = function(){
  var now = new Date();
  var later = now.getTime() + 7884000000;

  return {
    now   : now.toISOString(),
    later : new Date(later).toISOString()
  };
};
