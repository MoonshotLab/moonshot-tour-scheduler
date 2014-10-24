(function($){

  $.fn.friendSelector = function(opts){

    var $errs   = this.find('.errors');
    var $input  = this.find('input');
    var $list   = this.find('ul');
    var $button = this.find('button');


    var addFriend = function(){
      var email = $input.val();

      $errs.hide();
      $errs.html('');

      if(!utils.validateEmail(email)){
        $errs.append('<p>not a valid email :(</p>');
        $errs.show();
      } else{
        $list.append([
          '<li class="list-group-item">',
            '<span class="email">',
              email,
            '</span>',
            '<a class="badge delete-friend" href="#">x</a>',
          '</li>'
        ].join(''));

        $input.val('');
      }
    };


    var handleEvent = function(e){
      e.preventDefault();
      if(e.keyCode){
        if(e.keyCode == 13) addFriend();
      } else addFriend();
    };


    $button.click(handleEvent);
    $input.keyup(handleEvent);

    $list.click(function(e){
      e.preventDefault();
      if($(e.target).hasClass('delete-friend'))
        $(e.target).parent().remove();
    });


    return this;
  };

}(jQuery));
