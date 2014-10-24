// allow population of user data
var User = function(prepopObj){
  this.calendars  = [];

  var instance = this;
  for(var key in prepopObj){
    instance[key] = prepopObj[key];
  }
};



// time should be passed as a javascript date object
// will make DOM changes
User.prototype.markTimesAsBusy = function(selectedDate){
  var instance   = this;
  var selector   = 'td.user-' + instance._id;
  var $tableData = $('.time-table').find(selector);
  var busyEvents = instance.findBusyEventsOnDate(selectedDate);

  $tableData.each(function(i, el){
    var inThePast= false;
    var markBusy = false;
    var minute   = parseInt(el.dataset.minute);
    var hour     = parseInt(el.dataset.hour);
    var day      = selectedDate.getDate();
    var month    = selectedDate.getMonth();
    var year     = selectedDate.getFullYear();
    var now      = new Date();

    // Is the date viewed in the past?
    if(day <= now.getDate() && month <= now.getMonth()){
      if(day == now.getDate() && hour <= now.getHours()) inThePast = true;
      if(day < now.getDate()) inThePast = true;
      if(month < now.getMonth()) inThePast = true;
    }

    if(inThePast) $(el).addClass('past');

    busyEvents.forEach(function(busyEvent){
      var startMin    = busyEvent.start.getMinutes();
      var startHour   = busyEvent.start.getHours();
      var startDay    = busyEvent.start.getDate();
      var startMonth  = busyEvent.start.getMonth();
      var startYear   = busyEvent.start.getFullYear();
      var endMin      = busyEvent.end.getMinutes();
      var endHour     = busyEvent.end.getHours();
      var endDay      = busyEvent.end.getDate();
      var endMonth    = busyEvent.end.getMonth();
      var endYear     = busyEvent.end.getFullYear();

      // if the full day is booked
      if(endDay > day || endMonth > month || endYear > year){
        if(startDay != day || startMonth != month || startYear != year)
          markBusy = true;
      }

      // if the event spans multiple days, but is partial on the given day
      if(startDay != day){
        startHour = 0;
        startMinute = 0;
      } else if(endDay != day){
        endHour = 23;
        endMinute = 59;
      }

      // if part of the day is booked
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
// populates the instance's busyEvents
User.prototype.findBusyEventsOnDate = function(selectedDate){
  var instance          = this;
  var busyEvents        = [];
  var selectedDayMonth  = [
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

  for(var calendar in instance.calendars){
    instance.calendars[calendar].busy.forEach(checkEvent);
  }

  return busyEvents;
};



// times should be passed as ISO strings
User.prototype.fetchBusyData = function(timeMin, timeMax){
  var instance = this;
  var deferred = Q.defer();

  var earl = [
    '/isBusy/',
    this.emails[0].value,
    '?timeMin=',
    timeMin,
    '&timeMax=',
    timeMax,
    '&timeZone=',
    defaultTimeZone
  ].join('');

  $.ajax({
    url     : earl,
    success : function(res){
      instance.calendars = res.calendars;
      deferred.resolve();
    },
    error   : deferred.reject
  });

  return deferred.promise;
};
