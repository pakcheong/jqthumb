$(function(){

    $('#generate').click(function(){
        $('#demo').jqthumb({
            classname      : 'jqthumb',
            width          : $('#width').val() + $('#width-type').val(),
            height         : $('#height').val() + $('#height-type').val(),
            position       : { y: $('#y').val() + $('#y-type').val(), x: $('#x').val() + $('#x-type').val() },
            zoom           : $('#zoom').val(),
            method         : $('#method').val(),
            done           : function(objs){
                $('html, body').animate({scrolly: $('body').height(), scrollx: $('body').width() }, 800);

                if($('#width-type').val() == '%'){
                    $('#demo').parent().parent().css({
                        'width' : $(objs[0]).css('width'),
                        'overflow' : 'visible'
                    });
                }else{
                    $('#demo').parent().parent().css('width', 'auto');
                }

                if($('#height-type').val() == '%'){
                    $('#playground').find('.span6').eq(1).height($('#playground').height());
                    $('#playground').find('.span6').eq(1).find('.frame .frame-pad').height($('#playground').height());
                    $('#demo').parent().parent().css({
                        'height' : $(objs[0]).height(),
                        'overflow' : 'visible'
                    });
                }else{
                    $('#playground').find('.span6').eq(1).css('height', 'auto');
                    $('#playground').find('.span6').eq(1).find('.frame .frame-pad').css('height', 'auto');
                    $('#demo').parent().parent().css('height', 'auto');
                }
            }
        });
    });

    $('#kill').click(function(){
        $('#demo').jqthumb('kill');
        $('html, body').animate({scrolly: $('body').height()}, 800);
    });

    function fadeIn(obj){
        $(obj)
            .css('opacity', 0)
            .show()
            .animate({
                opacity: 1
            }, 2000);
    }


    $('.example1').jqthumb({
        classname : 'jqthumb',
        width     : '100%',
        height    : 121,
        position  : { y: '0%', x: '100%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example2').jqthumb({
        classname : 'jqthumb',
        width     : '100%',
        height    : 121,
        position  : { y: '100%', x: '100%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example3').jqthumb({
        classname : 'jqthumb',
        width     : '100%',
        height    : 295,
        position  : { y: '50%', x: '50%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example4').jqthumb({
        classname : 'jqthumb',
        width     : '100%',
        height    : 295,
        position  : { y: '50%', x: '0%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example5').jqthumb({
        classname : 'jqthumb',
        width     : '100%',
        height    : 295,
        position  : { y: '50%', x: '100%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example6').jqthumb({
        classname : 'jqthumb',
        width     : '100%',
        height    : 122,
        position  : { y: '50%', x: '50%' },
        zoom      : 1,
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example7').jqthumb({
        classname : 'jqthumb',
        width     : '100%',
        height    : 122,
        position  : { y: '35%', x: '43%' },
        zoom      : 3,
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });

});