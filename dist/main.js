$(function(){

    $('#generate').click(function(){

        if($('#ondemand').val() == 'true' && ($('#ondemandevent').val() == 'click' || $('#ondemandevent').val() == 'mouseenter')){
            $('#demo').parent().width(200);
            $('#demo').parent().height(200);
        }else{
            $('#demo').parent().css('width', 'auto');
            $('#demo').parent().css('width', 'auto');
        }

        $('#demo').jqthumb({
            source         : (function(){
                                if($('#url').val()){
                                    $('#demo').attr('attr-src', $('#url').val());
                                    return 'attr-src';
                                }
                                return 'src';
                            })(),
            classname      : 'jqthumb',
            width          : (function(){
                                        if($('#width-type').val() === 'auto'){
                                            return $('#width-type').val();
                                        }
                                        return $('#width').val() + $('#width-type').val();
                                    })(),
            height         : (function(){
                                        if($('#height-type').val() === 'auto'){
                                            return $('#height-type').val();
                                        }
                                        return $('#height').val() + $('#height-type').val();
                                    })(),
            position       : { y: $('#y').val() + $('#y-type').val(), x: $('#x').val() + $('#x-type').val() },
            zoom           : $('#zoom').val(),
            renderPosition : $('#renderPosition').val(),
            onDemand       : ($('#ondemand').val() == 'true') ? true : false,
            onDemandEvent  : $('#ondemandevent').val(),
            threshold      : $('#threshold').val(),
            method         : $('#method').val(),
            error          : function(status, imgUrl){
                // console.log(status);
                // console.log(imgUrl);
            },
            done           : function(objs){
                $('html, body').animate({scrolly: $('body').height(), scrollx: $('body').width() }, 800);

                if($('#width-type').val() == '%'){
                    $('#demo').parent().parent().css({
                        'width' : $(objs[0]).css('width'),
                        'overflow' : 'visible'
                    });
                }else if($('#width-type').val() == 'px'){
                    $('#demo').parent().parent().css('width', 'auto');
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
                }else if($('#height-type').val() == 'px'){
                    $('#playground').find('.span6').eq(1).css('height', 'auto');
                    $('#playground').find('.span6').eq(1).find('.frame .frame-pad').css('height', 'auto');
                    $('#demo').parent().parent().css('height', 'auto');
                }else{
                    $('#demo').parent().parent().css('width', 'auto');
                }
            }
        });
    });

    $('#height-type').change(function(){
        if($('#height-type').val() === 'auto'){
            $('#height').attr('disabled', 'disabled');
        }else{
            $('#height').removeAttr('disabled');
        }
    });

    $('#width-type').change(function(){
        if($('#width-type').val() === 'auto'){
            $('#width').attr('disabled', 'disabled');
        }else{
            $('#width').removeAttr('disabled');
        }
    });

    $('#ondemand').change(function(){
        if($('#ondemand').val() == 'true'){
            $('#ondemandevent').removeAttr('disabled');

            if($('#ondemandevent').val() == 'scroll'){
                $('#ondemandscrollcheck').removeAttr('disabled');
            }else{
                $('#ondemandscrollcheck').attr('disabled', 'disabled');
            }
        }else{
            $('#ondemandevent').attr('disabled', 'disabled');
            $('#ondemandscrollcheck').attr('disabled', 'disabled');
        }
    });

    $('#ondemandevent').change(function(){
        if($('#ondemandevent').val() == 'scroll'){
            $('#ondemandscrollcheck').removeAttr('disabled');
        }else{
            $('#ondemandscrollcheck').attr('disabled', 'disabled');
        }
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


    $('.original').jqthumb({
        classname : 'jqthumb',
        source    : 'attr-src',
        width     : 440,
        height    : 294,
        zoom      : 1,
        position  : { y: '50%', x: '50%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example1').jqthumb({
        classname : 'jqthumb',
        source    : 'attr-src',
        width     : '100%',
        height    : 121,
        zoom      : 1.3,
        position  : { y: '50%', x: '50%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example2').jqthumb({
        classname : 'jqthumb',
        source    : 'attr-src',
        width     : '100%',
        height    : 121,
        zoom      : 1.3,
        position  : { y: '100%', x: '45%' },
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example3').jqthumb({
        classname : 'jqthumb',
        source    : 'attr-src',
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
        source    : 'attr-src',
        width     : '100%',
        height    : 295,
        position  : { y: '50%', x: '12%' },
        show      : false,
        onDemand: true,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example5').jqthumb({
        classname      : 'jqthumb',
        source    : 'attr-src',
        width          : '100%',
        height         : 295,
        position       : { y: '50%', x: '77%' },
        show           : false,
        renderPosition : 'after',
        // ondemand       : true,
        before         : function(oriImage){},
        after          : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example6').jqthumb({
        classname : 'jqthumb',
        source    : 'attr-src',
        width     : '100%',
        height    : 122,
        position  : { y: '-56px', x: '-56px' },
        zoom      : 2,
        show      : false,
        before    : function(oriImage){},
        after     : function(imgObj){
            fadeIn($(imgObj));
        }
    });


    $('.example7').jqthumb({
        classname           : 'jqthumb',
        source              : 'attr-src',
        width               : '100%',
        height              : 122,
        position            : { y: '40%', x: '75%' },
        zoom                : 2,
        show                : false,
        renderPosition      : 'after',
        onDemand            : true,
        onDemandScrollCheck : 0,
        debug: true,
        before              : function(oriImage){},
        after               : function(imgObj){
            fadeIn($(imgObj));
        }
    });

});