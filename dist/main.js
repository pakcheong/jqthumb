$(function(){

    $('#generate').click(function(){
        $('#demo').jqthumb({
            classname      : 'jqthumb',
            width          : $('#width').val(),
            height         : $('#height').val(),
            position       : { top: $('#top').val(), left: $('#left').val() },
            done           : function(){ $('html, body').animate({scrollTop: $('body').height(), scrollLeft: $('body').width() }, 800); }
        });
    });

    $('#kill').click(function(){
        $('#demo').jqthumb('kill');
        $('html, body').animate({scrollTop: $('body').height()}, 800);
    });


    $('.example1').jqthumb({
        classname      : 'jqthumb',
        width          : '100%',
        height         : 121,
        position       : { top: '0%', left: '100%' },
        showoncomplete : false,
        before         : function(oriImage){},
        after          : function(imgObj){
            $(imgObj)
                .css('opacity', 0)
                .show()
                .animate({
                    opacity: 1
                }, 2000);
        }
    });


    $('.example2').jqthumb({
        classname      : 'jqthumb',
        width          : '100%',
        height         : 121,
        position       : { top: '100%', left: '100%' },
        showoncomplete : false,
        before         : function(oriImage){},
        after          : function(imgObj){
            $(imgObj)
                .css('opacity', 0)
                .show()
                .animate({
                    opacity: 1
                }, 2000);
        }
    });


    $('.example3').jqthumb({
        classname      : 'jqthumb',
        width          : '100%',
        height         : 295,
        position       : { top: '50%', left: '50%' },
        showoncomplete : false,
        before         : function(oriImage){},
        after          : function(imgObj){
            $(imgObj)
                .css('opacity', 0)
                .show()
                .animate({
                    opacity: 1
                }, 2000);
        }
    });


    $('.example4').jqthumb({
        classname      : 'jqthumb',
        width          : '100%',
        height         : 295,
        position       : { top: '50%', left: '0%' },
        showoncomplete : false,
        before         : function(oriImage){},
        after          : function(imgObj){
            $(imgObj)
                .css('opacity', 0)
                .show()
                .animate({
                    opacity: 1
                }, 2000);
        }
    });


    $('.example5').jqthumb({
        classname      : 'jqthumb',
        width          : '100%',
        height         : 295,
        position       : { top: '50%', left: '100%' },
        showoncomplete : false,
        before         : function(oriImage){},
        after          : function(imgObj){
            $(imgObj)
                .css('opacity', 0)
                .show()
                .animate({
                    opacity: 1
                }, 2000);
        }
    });


    $('.example6').jqthumb({
        classname      : 'jqthumb',
        width          : '100%',
        height         : 122,
        position       : { top: '50%', left: '0%' },
        showoncomplete : false,
        before         : function(oriImage){},
        after          : function(imgObj){
            $(imgObj)
                .css('opacity', 0)
                .show()
                .animate({
                    opacity: 1
                }, 2000);
        }
    });


    $('.example7').jqthumb({
        classname      : 'jqthumb',
        width          : '100%',
        height         : 122,
        position       : { top: '100%', left: '100%' },
        showoncomplete : false,
        before         : function(oriImage){},
        after          : function(imgObj){
            $(imgObj)
                .css('opacity', 0)
                .show()
                .animate({
                    opacity: 1
                }, 2000);
        }
    });

});