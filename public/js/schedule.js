$(function(){

  // prepopulate the date picker and attache event listeners to the prev and
  // next date selectors
  updateDateController(new Date().getTime());
  $('.date-controller').find('a').click(function(e){
    e.preventDefault();
    var selectedTime = $(this).data('time');
    updateDateController(selectedTime);
  });

  // Fetch busy data for each user
  var ISOStamps = nowAndLaterAsIsos();
  users.forEach(function(user){
    fetchBusyData(
      user.emails[0].value, ISOStamps.now, ISOStamps.later
    ).then(function(res){
      console.log(res);
    }).fail(function(err){
      console.log(err);
    });
  });

});


// time should be passed as a UTC
var updateDateController = function(selectedTime){
  var $container = $('.date-controller');

  var format = function(timestamp){
    var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    var date = new Date(timestamp);
    var day = date.getDate();
    var month = date.getMonth();

    return [
      months[month],
      ' ',
      day
    ].join('');
  };

  var before = selectedTime - 86400000;
  var later = selectedTime + 86400000;

  $container.find('.prev-date').text(format(before)).data('time', before);
  $container.find('.current-date').text(format(selectedTime)).data('time', selectedTime);
  $container.find('.next-date').text(format(later)).data('time', later);
};


// times should be passed as ISO strings
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


var nowAndLaterAsIsos = function(){
  var now = new Date();
  var later = now.getTime() + 7884000000;

  return {
    now   : now.toISOString(),
    later : new Date(later).toISOString()
  };
};
