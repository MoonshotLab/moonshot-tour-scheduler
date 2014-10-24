(function($){

  $.fn.timeSelector = function(opts){

    var settings = $.extend({
      onChange : function(){}
    }, opts);

    var $table = $(this);
    var $tr = $table.find('tr').not('.selector');
    var $selector = $table.find('tr.selector');
    var $selectedRow;
    var meetingLength = 30;


    this.changeTimes = function(times){
      var $input = $(this);
      var val = $input.val();

      if($input.attr('name') == 'startTime')
        $selectedRow = $table.find('td[data-full-time="' + val + '"]').parent();

      animateSelector();
    };


    var getTimes = function(){
      var startTime, endTime, $nextRow;

      if(meetingLength == 30)
        $nextRow = $selectedRow.next();
      else
        $nextRow = $selectedRow.next().next();

      return {
        start : $selectedRow.find('td').data('full-time'),
        end   : $nextRow.find('td').data('full-time')
      };
    };


    var animateSelector = function(){
      var index = $selectedRow.index('tr');
      var position = 55 + (index-2)*40;
      $selector.css('top', position);
    };


    $tr.click(function(){
      $selectedRow = $(this);
      settings.onChange(getTimes());
      animateSelector();
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

    return this;
  };

}(jQuery));
