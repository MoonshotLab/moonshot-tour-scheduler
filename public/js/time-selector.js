(function($){

  $.fn.timeSelector = function(opts){

    var settings = $.extend({
      autoFill      : false,
      cleanUp       : false,
      cleanUpTimer  : 300,
      done          : function(){}
    }, opts);

    var $el = $(this);
    var $tr = $el.find('tr').not('.selector');
    var $selector = $el.find('tr.selector');

    $tr.click(function(){
      var index = $(this).index('tr');
      var position = 55 + (index-2)*40;

      $selector.css('top', position);
    });

    $selector.find('.choice').click(function(){
      if($(this).data('value') == '60')
        $selector.find('td').css('height', 80);
      else
        $selector.find('td').css('height', 40);

      $(this).parent().find('.indicator').html('');
      $(this).find('.indicator').html('&times;');
    });
  };

}(jQuery));
