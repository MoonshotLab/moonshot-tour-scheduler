window.moonshot = {
  defaultTimeZone : 'America/Chicago',
  labRats : [],
  scheduler : new User(prepopulatedData.scheduler)
};

window.calendar_languages = {
  'en-US' : {
    d0: 'Su', d1: 'Mo', d2: 'Tu', d3: 'We', d4: 'Th', d5: 'Fr', d6: 'Sa'
  }
};



// initialize the users, fetch busy data for each
(function(){
  var now = new Date();
  var later = now.getTime() + 7884000000;

  var iso = {
    now   : now.toISOString(),
    later : new Date(later).toISOString()
  };

  prepopulatedData.labRats.forEach(function(rat){
    var user = new User(rat);

    user.fetchBusyData(iso.now, iso.later)
      .then(function(){
        user.markTimesAsBusy(now);
      }).fail(function(e){
        console.log(e);
      });

    moonshot.labRats.push(user);
  });
})();



// validate and submit form
(function(){
  $('#validate').click(function(){
    form.clearErrors();
    var errors = form.validate();

    if(errors.length === 0){
      $('#confirm-modal').modal();
      form.populateConfirm(form.collectData());
    } else form.showErrors(errors);
  });

  $('#submit').click(function(){
    if(form.checkPromise()){
      submitForm(form.collectData())
        .then(form.showSuccess)
        .fail(function(err){
          alert(err.statusText);
        });
    }
  });
})();



// init and control calendar
(function(){
  var $calendar = $('#calendar');
  var calendar = $calendar.calendar({
    tmpl_path       : '/calendar-templates/',
    language        : 'en-US',
    events_source   : function () { return []; },
    onAfterViewLoad : function(view){
      $('.calendar-month').text(this.getTitle());
    }
  });

  // overwrite the update function, prolly bad practice
  // but this rerenders everything. we dont want it.
  calendar._update = function(){};

  // visually mark today as selected
  setTimeout(function(){
    $calendar.find('.cal-day-today').addClass('cal-day-selected');
    var calendarDate = $calendar.find('.cal-day-selected').find('span').data('cal-date');
    $('input[name=date]').val(calendarDate);
  }, 500);

  // handle clicks
  $calendar.click(function(e){
    var $target = $(e.target);
    var calendarDate = $target.data('cal-date');

    if(calendarDate){
      $('input[name=date]').val(calendarDate);

      $calendar.find('.cal-day-selected').removeClass('cal-day-selected');
      $target.parent().addClass('cal-day-selected');

      // clean up table
      $('.time-table').find('td').removeClass('busy past');

      // i don't know why this is necessary :(
      var selectedDateTime = new Date(Date.parse(calendarDate) + 86400000);

      // check users
      moonshot.labRats.forEach(function(user){
        user.markTimesAsBusy(selectedDateTime);
      });
    }
  });

  // Make the date buttons change up the calendar
  $('.date-controller').find('.btn').click(function(){
    var directive = $(this).data('directive');
    calendar.navigate(directive);
  });
})();



// init the time selector and time pickers
// bind reactive events to both
(function(){

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
})();



// Add and remove friends
$(function(){ $('.friend-selector').friendSelector(); });
