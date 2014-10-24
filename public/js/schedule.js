window.defaultTimeZone = 'America/Chicago';
window.users = [];
window.calendar_languages = {};



// initialize the users, fetch busy data for each
(function(){
  var now = new Date();
  var later = now.getTime() + 7884000000;

  var iso = {
    now   : now.toISOString(),
    later : new Date(later).toISOString()
  };

  labRats.forEach(function(rat){
    var user = new User(rat);

    user.fetchBusyData(iso.now, iso.later)
      .then(function(){
        user.markTimesAsBusy(now);
      }).fail(function(e){
        console.log(e);
      });

    window.users.push(user);
  });
})();



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
      window.users.forEach(function(user){
        user.markTimesAsBusy(selectedDateTime);
      });
    }
  });

  // Make the date buttons change up the calendar
  $('.date-controller').find('.btn').click(function(){
    var directive = $(this).data('directive');
    calendar.navigate(directive);
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
    'changeTime'      : timeSelector.update
  };

  var nowTime = new Date().getTime();
  $('input[name=startTime]').timepicker(timeOptions)
    .timepicker('setTime', new Date(nowTime + 1800000))
    .on('changeTime', timeSelector.changeTimes)
    .trigger('changeTime');
  $('input[name=endTime]').timepicker(timeOptions)
    .timepicker('setTime', new Date(nowTime + 1800000*2))
    .on('changeTime', timeSelector.changeTimes)
    .trigger('changeTime');
});


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
    email : $('input[name=schedulerEmail]').val(),
    name  : scheduler.name
  }];
  users.forEach(function(user){
    attendees.push({
      name  : user.displayName,
      email : user.emails[0].value
    });
  });
  $('ul.friends li').each(function(i, el){
    attendees.push({
      email : $(el).find('.email').text()
    });
  });

  var dateVal = $('input[name=date]').val();
  var startVal = $('input[name=startTime]').val()
    .replace('am', '').replace('pm', '');
  var endVal = $('input[name=endTime]').val()
    .replace('am', '').replace('pm', '');

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
  window.location('/thanks');
};


var populateConfirmModal = function(formData){
  var $container = $('#confirm-modal');
  for(var key in formData){
    var data = formData[key];

    if(key == 'start' || key == 'end'){
      var humanTime = formData[key].dateTime.replace('T' , ' ');
      humanTime = humanTime.substring(11, 16);
      data = humanTime;
    }

    if(key == 'attendees'){
      data = '';
      formData[key].forEach(function(attendee){
        var name = attendee.name || attendee.email;
        var template = [
          '<li class="checkbox">',
            '<label>',
              '<input type="checkbox" checked value="' + attendee.email + '" />',
              name,
            '</label>',
          '</li>'
        ].join('');
        data += template;
      });
    }

    $container.find('.' + key).find('.contents').html(data);
  }

  var theDate = formData.start.dateTime.substring(0, 10);
  var humanDate = [
    theDate.substring(5,7),
    theDate.substring(8,10),
    theDate.substring(0,4)
  ].join('/');
  $container.find('.date').find('.contents').html(humanDate);
};
