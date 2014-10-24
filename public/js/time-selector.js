(function($){

  $.fn.timeSelector = function(opts){

    var settings = $.extend({
      onChange : function(){}
    }, opts);

    var $el = $(this);
    var $tr = $el.find('tr').not('.selector');
    var $selector = $el.find('tr.selector');
    var $selectedRow;
    var meetingLength = 30;


    var getTimes = function(){
      var startTime, endTime, $nextRow;

      if(meetingLength == 30)
        $nextRow = $selectedRow.next();
      else
        $nextRow = $selectedRow.next().next();

      startTime = $selectedRow.find('td')
        .data('hour') + ':' + $selectedRow.find('td').data('minute');

      endTime = $nextRow.find('td')
        .data('hour') + ':' + $nextRow.find('td').data('minute');

      return {
        start : startTime,
        end   : endTime
      };
    };


    $tr.click(function(){
      var index = $(this).index('tr');
      var position = 55 + (index-2)*40;
      $selector.css('top', position);

      $selectedRow = $(this);
      settings.onChange(getTimes());
    });


    $selector.find('.choice').click(function(){
      meetingLength = parseInt($(this).data('value'));
      settings.onChange(getTimes());

      var $row = $(this).parent().parent();
      if(meetingLength == 60) $row.css('height', 80);
      else $row.css('height', 40);

      $(this).parent().find('.indicator').html('');

      // let animation complete
      var $self = $(this);
      setTimeout(function(){
        $self.find('.indicator').html('&times;');
      }, 300);
    });
  };

}(jQuery));
