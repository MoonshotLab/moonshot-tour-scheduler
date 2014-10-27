var utils = {

  validateEmail : function(email){
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },


  // pass me something like '2:00am'
  convert12hTo24hTime : function(timeStr){
    var meridian  = timeStr.substring(timeStr.length - 2, timeStr.length);
    var splits    = timeStr.substring(0, timeStr.length - 2).split(':');
    var hours     = Number(splits[0]);
    var minutes   = splits[1];

    if(meridian == 'pm' && hours < 12)
      hours = hours + 12;
    else if(meridian == 'am' && hours == 12)
      hours = hours - 12;

    return hours + ':' + minutes + ':00';
  }
};
