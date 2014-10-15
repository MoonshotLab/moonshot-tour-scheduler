$(function(){

  // prepopulate the date picker and attache event listeners to the prev and
  // next date selectors
  updateDateController(new Date().getTime());
  $('.date-controller').find('a').click(function(e){
    e.preventDefault();
    var selectedDateTime = $(this).data('time');
    updateDateController(selectedDateTime);
    $('td').removeClass('busy');

    users.forEach(function(user){
      var busyEvents = findBusyEventsWithinDay(new Date(selectedDateTime), user);
      markTimesAsBusy(user, new Date(selectedDateTime), busyEvents);
    });
  });


  // Fetch busy data for each user
  var now = new Date();
  var later = now.getTime() + 7884000000;

  var ISOStamps = {
    now   : now.toISOString(),
    later : new Date(later).toISOString()
  };

  users.forEach(function(user){
    fetchBusyData(
      user.emails[0].value, ISOStamps.now, ISOStamps.later
    ).then(function(res){
      user.calendars = res.calendars;
      $('.time-table').show();
    }).fail(function(err){
      alert(err);
    });
  });

});


// time should be passed as a javascript date object
// will make DOM changes
var markTimesAsBusy = function(user, selectedDate, busyEvents){

  var selector   = 'td.user-' + user._id;
  var $tableData = $('.time-table').find(selector);

  $tableData.each(function(i, el){
    var markBusy = false;
    var hour = el.dataset.hour;
    var minute = el.dataset.minute;

    busyEvents.forEach(function(busyEvent){
      var startHour = busyEvent.start.getHours();
      var startMin  = busyEvent.start.getMinutes();
      var endHour   = busyEvent.end.getHours();
      var endMin    = busyEvent.end.getMinutes();

      if(hour >= startHour && hour <= endHour){

        if(hour > startHour && hour < endHour){
          markBusy = true;
        } else if(hour == startHour){
          if(minute >= startMin) markBusy = true;
        } else if(hour == endHour){
          if(minute <= endMin) markBusy = true;
        }
      }
    });

    if(markBusy) $(el).addClass('busy');
  });
};


// time should be passed as a javascript date object
// returns an array of javascript date objects
var findBusyEventsWithinDay = function(selectedDate, user){
  var busyEvents = [];

  var selectedDayMonth = [
    selectedDate.getDate(),
    '-',
    selectedDate.getMonth()
  ].join('');

  var checkEvent = function(busyEvent){
    var isBusyEvent = false;
    var startDate   = new Date(busyEvent.start);
    var endDate     = new Date(busyEvent.end);

    var startDayMonth = [startDate.getDate(), '-', startDate.getMonth()].join('');
    var endDayMonth   = [endDate.getDate(), '-', endDate.getMonth()].join('');

    // is there an event "on" this day?
    if( startDayMonth == selectedDayMonth ||
        endDayMonth == selectedDayMonth )
    { isBusyEvent = true; }

    // does the event span multiple days?
    if( startDate.getTime() < selectedDate.getTime() &&
        endDate.getTime() > selectedDate.getTime() )
    { isBusyEvent = true; }

    // append the event if it's busy
    if(isBusyEvent){
      busyEvents.push({
        start : startDate,
        end   : endDate
      });
    }
  };

  for(var calendar in user.calendars){
    user.calendars[calendar].busy.forEach(checkEvent);
  }

  return busyEvents;
};


// time should be passed as a UTC
var updateDateController = function(selectedDateTime){
  var $container = $('.date-controller');

  var format = function(timestamp){
    var months = [ 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    var date = new Date(timestamp);
    var day = date.getDate();
    var month = date.getMonth();

    return [
      months[month],
      ' ',
      day
    ].join('');
  };

  var before = selectedDateTime - 86400000;
  var later = selectedDateTime + 86400000;

  $container.find('.prev-date').text(format(before)).data('time', before);
  $container.find('.current-date').text(format(selectedDateTime)).data('time', selectedDateTime);
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
