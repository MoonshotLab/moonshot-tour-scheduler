var form = {

  clearErrors : function(){
    $('#form-errors').hide();
    $('#form-errors').html('');
  },


  validate : function(){
    var errors = [];

    var scheduler = $('input[name=schedulerEmail]').val();
    var client = $('input[name=client]').val();
    var startTime = $('input[name=startTime]').val();
    var endTime = $('input[name=endTime]').val();
    var date = $('input[name=date]').val();

    if(!utils.validateEmail(scheduler))
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
  },


  checkPromise : function(){
    var $container = $('#confirm-modal');
    $container.find('.errors').hide();
    $container.find('.errors').html();

    if(!$container.find('input[name=promise]:checked').length){
      $container.find('.errors').html('Please, please promise to be on time');
      $container.find('.errors').show();
      return false;
    } else return true;
  },


  showErrors : function(errors){
    var $container = $('#form-errors');
    $container.show();

    errors.forEach(function(error){
      $container.append([
        '<p>', error, '</p>'
      ].join(''));
    });
  },


  collectData : function(){
    var attendees = [window.scheduler];

    window.users.forEach(function(user){
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
    var start24h = utils.convert12hTo24hTime(
      $('input[name=startTime]').val()
    );
    var end24h = utils.convert12hTo24hTime(
      $('input[name=endTime]').val()
    );

    var startTime = {
      dateTime : [dateVal, 'T', start24h, ':00'].join(''),
      human    : $('input[name=startTime]').val(),
      timeZone : defaultTimeZone
    };
    var endTime = {
      dateTime : [dateVal, 'T', end24h, ':00'].join(''),
      human    : $('input[name=endTime]').val(),
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
  },


  populateConfirm : function(formData){
    var $container = $('#confirm-modal');
    for(var key in formData){
      var data = formData[key];

      if(key == 'start' || key == 'end')
        data = formData[key].human;

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
  },


  submit : function(formData){
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
  },


  showSuccess : function(){
    window.location('/thanks');
  }
};
