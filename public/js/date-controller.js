(function($){

  var months = [ 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];


  $.fn.dateController = function(opts){

    var self = this;
    var settings = $.extend({
      onUpdate : function(){}
    }, opts);


    var formatUTCAsReadable = function(utc){
      var date  = new Date(utc);
      var day   = date.getDate();
      var month = date.getMonth();

      return [
        months[month],
        ' ',
        day
      ].join('');
    };


    var update = function(utc){
      var before = utc - 86400000;
      var later  = utc + 86400000;

      this.find('.prev-date').text(
        formatUTCAsReadable(before)
      ).data('time', before);

      this.find('.current-date').text(
        formatUTCAsReadable(utc)
      ).data('time', utc);

      this.find('.next-date').text(
        formatUTCAsReadable(later)
      ).data('time', later);

      settings.onUpdate(utc);
    };


    this.find('a').click(function(e){
      e.preventDefault();

      var dateTime = $(this).data('time');
      self.update(dateTime);
    });


    this.update = update;
    return this;
  };

}(jQuery));
