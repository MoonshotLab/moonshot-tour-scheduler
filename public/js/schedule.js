var defaultTimeZone = 'America/Chicago';

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


  // Handle form submission
  $('#submit-form').click(function(e){
    e.preventDefault();

    $('#form-errors').hide();
    $('#form-errors').html('');

    var errors = validateForm();
    if(errors.length === 0){
      submitForm(collectFormData())
        .then(showFormConfirmation)
        .fail(function(err){
          alert(err.responseText);
        });
    } else showFormErrors(errors);
  });
});


// time should be passed as a javascript date object
// will make DOM changes
var markTimesAsBusy = function(user, selectedDate, busyEvents){

  var selector   = 'td.user-' + user._id;
  var $tableData = $('.time-table').find(selector);

  $tableData.each(function(i, el){
    var markBusy = false;
    var minute   = el.dataset.minute;
    var hour     = el.dataset.hour;
    var day      = selectedDate.getDate();
    var month    = selectedDate.getMonth();
    var year     = selectedDate.getFullYear();

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
    '&timeZone=',
    defaultTimeZone
  ].join('');

  $.ajax({
    url     : earl,
    success : deferred.resolve,
    error   : deferred.reject
  });

  return deferred.promise;
};


var validateForm = function(){
  var errors = [];

  var scheduler = $('input[name=schedulerEmail]').val();
  var client = $('input[name=client]').val();

  if(!validateEmail(scheduler))
    errors.push('Your E-Mail address is invalid');
  if(client.length === 0)
    errors.push('Please add a client or group');

  return errors;
};


var validateEmail = function(email){
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};


var showFormErrors = function(errors){
  var $container = $('#form-errors');
  $container.show();

  errors.forEach(function(error){
    $container.append([
      '<li>', error, '</li>'
    ].join(''));
  });
};


var collectFormData = function(){

  var attendees = [{
    email : $('input[name=schedulerEmail]').val()
  }];
  users.forEach(function(user){
    attendees.push({
      email : user.emails[0].value
    });
  });

  var startTime = {
    dateTime : '2014-10-16T10:00:00',
    timeZone : defaultTimeZone
  };
  var endTime = {
    dateTime : '2014-10-16T10:00:00',
    timeZone : defaultTimeZone
  };

  var note = '';
  if($('input[name=number-attending]').val())
    note = $('input[name=number-attending]').val() + ' people attending.';

  return {
    summary     : 'Moonshot Lab Tour ' + 'for ' + $('input[name=client]').val(),
    description : $('textarea[name=description]').val() + ' ' + note,
    attendees   : attendees,
    start       : startTime,
    end         : endTime
  };
};


var submitForm = function(formData){
  var deferred = Q.defer();

  $.ajax({
    type        : 'POST',
    contentType : 'application/json',
    url         : '/create-event',
    data        : JSON.stringify(formData),
    success     : deferred.resolve,
    error       : deferred.reject
  });

  return deferred.promise;
};


var showFormConfirmation = function(formData){
  console.log(formData);
};
