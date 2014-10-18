(function($){

  $.fn.timeSelector = function(opts){
    var settings = $.extend({
      autofill : false,
      cleanup  : false
    }, opts);


    var handleMouseDown = function(){
      mouseIsDown = true;

      $tr.removeClass('last-selected');
      if($(this).hasClass('selected')){
        $(this).removeClass('selected');
      } else{
        $(this).addClass('selected');
      }
    };


    var handleMouseOver = function(){
      if(mouseIsDown) $(this).toggleClass('selected');
    };


    var handleMouseUp = function(){
      if($(this).hasClass('selected')){
        $(this).addClass('last-selected');
      }
    };


    var handleMouseRelease = function(){
      mouseIsDown = false;

      if(settings.autofill) autoFill();
      if(settings.cleanup) cleanUp();
    };


    // smart fills spaces that look like they shold be filled
    var autoFill = function(){
      clearTimeout(autoFillTimer);

      autoFillTimer = setTimeout(function(){
        var $last = $('tr.last-selected').last();
        var $next = $last.next();
        var $prev = $last.prev();

        var goForwards = true;
        while(goForwards){
          if(!($next.hasClass('selected')) && $next.next().hasClass('selected'))
            $next.addClass('selected');
          else if(!($next.hasClass('selected')))
            goForwards = false;

          $next = $next.next();
          if(!$next.length) goForwards = false;
        }

        var goBackwards = true;
        while(goBackwards){
          if(!($prev.hasClass('selected')) && $prev.prev().hasClass('selected'))
            $prev.addClass('selected');
          else if(!($prev.hasClass('selected')))
            goBackwards = false;

          $prev = $prev.prev();
          if(!$prev.length) goBackwards = false;
        }
      }, 100);
    };


    var cleanUp = function(){
      clearTimeout(cleanUpTimer);

      cleanUpTimer = setTimeout(function(){
        var $last = $('tr.last-selected').last();
        var okIndices = [$last.index('tr')];
        var $next = $last.next();
        var $prev = $last.prev();

        var goForwards = true;
        while(goForwards){
          if($next.hasClass('selected')) okIndices.push($next.index('tr'));
          else goForwards = false;

          $next = $next.next();
          if(!$next.length) goForwards = false;
        }

        var goBackwards = true;
        while(goBackwards){
          if($prev.hasClass('selected')) okIndices.push($prev.index('tr'));
          else goBackwards = false;

          $prev = $prev.prev();
          if(!$prev.length) goBackwards = false;
        }

        $('tr').each(function(i, el){
          if(okIndices.indexOf(i) == -1){
            $(el).removeClass('selected');
          }
        });
      }, 300);
    };


    var autoFillTimer;
    var cleanUpTimer;
    var mouseIsDown = false;
    var $tr = $(this).find('tr');

    $tr.mousedown(handleMouseDown);
    $tr.mouseover(handleMouseOver);
    $tr.mouseup(handleMouseUp);
    $('body').mouseup(handleMouseRelease);

    return this;
  };

}(jQuery));
