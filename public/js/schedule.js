var defaultTimeZone = 'America/Chicago';
window.calendar_languages = {};

$(function(){

  // Init Calendar
  window.calendar_languages['en-US'] = {
    d0: 'Su', d1: 'Mo', d2: 'Tu', d3: 'We', d4: 'Th', d5: 'Fr', d6: 'Sa'
  };

  // Create the calendar
  var $calendar = $('#calendar');
  var calendar = $calendar.calendar({
    tmpl_path       : '/calendar-templates/',
    language        : 'en-US',
    events_source   : function () { return []; },
    onAfterViewLoad : function(view){
      $('.calendar-month').text(this.getTitle());
    }
  });
  // Overwrite the update function
  calendar._update = function(){};

  // Mark today as selected
  setTimeout(function(){
    $calendar.find('.cal-day-today').addClass('cal-day-selected');
    var calendarDate = $calendar.find('.cal-day-selected').find('span').data('cal-date');
    $('input[name=date]').val(calendarDate);
  }, 500);

  // Deal with clicks and stuff or whatever
  $calendar.click(function(e){
    var $target = $(e.target);
    var calendarDate = $target.data('cal-date');

    if(calendarDate){
      // populate form
      $('input[name=date]').val(calendarDate);

      // show selected day in calendar view
      $calendar.find('.cal-day-selected').removeClass('cal-day-selected');
      $target.parent().addClass('cal-day-selected');

      // clean up table
      $('.time-table').find('td').removeClass('busy past');

      // i don't know why this is necessary :(
      var selectedDateTime = new Date(Date.parse(calendarDate) + 86400000);

      // check users
      users.forEach(function(user){
        var busyEvents = findBusyEventsWithinDay(selectedDateTime, user);
        markTimesAsBusy(user, selectedDateTime, busyEvents);
      });
    }
  });

  // Make the date buttons change up the calendar
  $('.date-controller').find('.btn').click(function(){
    var directive = $(this).data('directive');
    calendar.navigate(directive);
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

      users.forEach(function(user){
        markTimesAsBusy(user, now, findBusyEventsWithinDay(now, user));
      });

    }).fail(function(err){
      alert(err);
    });
  });


  // Check for errors, show form confirmation
  $('#validate').click(function(){
    $('#form-errors').hide();
    $('#form-errors').html('');

    var errors = validateForm();
    if(errors.length === 0){
      $('#confirm-modal').modal();
      populateConfirmModal(collectFormData());
    } else showFormErrors(errors);
  });


  // Submit form
  $('#submit').click(function(){
    var checkPromise = function(){
      var $container = $('#confirm-modal');
      $container.find('.errors').hide();
      $container.find('.errors').html();

      if(!$container.find('input[name=promise]:checked').length){
        $container.find('.errors').html('Please, please promise to be on time');
        $container.find('.errors').show();
        return false;
      } else return true;
    };

    if(checkPromise()){
      submitForm(collectFormData())
        .then(showFormConfirmation)
        .fail(function(err){
          alert(err.statusText);
        });
    }
  });


  // Add and remove friends
  $('.friend-selector').friendSelector();


  // init the time selector
  var timeSelector = $('table').timeSelector({
    onChange : function(time){
      $('input[name=startTime]').val(time.start);
      $('input[name=endTime]').val(time.end);
    }
  });


  // add tiempickers
  var timeOptions = {
    'scrollDefault'   : 'now',
    'minTime'         : '8:00am',
    'maxTime'         : '6:30pm',
    'forceRoundTime'  : true,
    'step'            : 15,
    'change'          : timeSelector.update
  };

  $('input[name=startTime]').timepicker(timeOptions);
  $('input[name=endTime]').timepicker(timeOptions);

});


// time should be passed as a javascript date object
// will make DOM changes
var markTimesAsBusy = function(user, selectedDate, busyEvents){

  var selector   = 'td.user-' + user._id;
  var $tableData = $('.time-table').find(selector);

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
  var startTime = $('input[name=startTime]').val();
  var endTime = $('input[name=endTime]').val();
  var date = $('input[name=date]').val();

  if(!validateEmail(scheduler))
    errors.push('Your E-Mail address is invalid');
  if(client.length === 0)
    errors.push('Please add a client or group');
  if(startTime.indexOf(':') == -1)
    errors.push('Please add a start time');
  if(endTime.indexOf(':') == -1)
    errors.push('Please add an end time');
  if(date.indexOf('-') == -1)
    errors.push('Please add a date');

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
      '<p>', error, '</p>'
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
  $('ul.friends li').each(function(i, el){
    attendees.push({
      email : $(el).find('.email').text()
    });
  });

  var dateVal = $('input[name=date]').val();
  var startVal = $('input[name=startTime]').val();
  var endVal = $('input[name=endTime]').val();

  var startTime = {
    dateTime : [dateVal, 'T', startVal, ':00'].join(''),
    timeZone : defaultTimeZone
  };
  var endTime = {
    dateTime : [dateVal, 'T', endVal, ':00'].join(''),
    timeZone : defaultTimeZone
  };

  var note = '';
  if($('input[name=number-attending]').val())
    note = '- ' + $('input[name=number-attending]').val() + ' people attending.';

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
  alert('Thanks, your time has been booked');
};


var populateConfirmModal = function(formData){
  var $container = $('#confirm-modal');
  for(var prop in formData){
    var key = prop;
    var data = formData[prop];

    if(key == 'start' || key == 'end'){
      var humanTime = formData[prop].dateTime.replace('T' , ' ');
      humanTime = humanTime.substring(0, 16);
      data = humanTime;
    }

    if(key == 'attendees'){
      data = '';
      formData[prop].forEach(function(attendee){
        var template = '<li>' + attendee.email + '</li>';
        data += template;
      });
    }

    $container.find('.' + key).find('.contents').html(data);
  }
};
