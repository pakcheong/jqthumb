/*!
    jQThumb 1.7.0
    Copyright (c) 2013-2014
    Dual licensed under the MIT and GPL licenses.

    Author       : Pak Cheong
    Version      : 1.7.0
    Repo         : https://github.com/pakcheong/jqthumb
    Demo         : http://pakcheong.github.io/jqthumb/
    Last Updated : Monday, May 26th, 2014, 6:10:32 PM
    Requirements : jQuery v1.3 or later
*/
;(function ( $, window, document, undefined ) {

    var pluginName = "jqthumb",
        defaults = {
            classname: 'jqthumb',
            width: 100,
            height: 100,
            position: {
                top: '50%',
                left: '50%'
            },
            source: 'src',
            showoncomplete: true,
            before: function(){},
            after: function(){},
            done: function(){}
        },
        global = {
            elemCounter: 0,
            totalElems: 0,
            inputElems: {}, // store all the elements before executing
            outputElems: []
        };


    function Plugin ( element, options ) {// The actual plugin constructor
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
            this.settings.width            = this.settings.width.toString().replace(/px/g, '');
            this.settings.height        = this.settings.height.toString().replace(/px/g, '');
            this.settings.position.top    = this.settings.position.top.toString().replace(/px/g, '');
            this.settings.position.left    = this.settings.position.left.toString().replace(/px/g, '');
        this._defaults = defaults;
        this._name = pluginName;

        if(typeof options == 'string'){
            if(options.toLowerCase() == 'kill'){
                this.kill(this.element);
            }
        }else{
            this.init();
        }
    }

    Plugin.prototype = {
        init: function () {
            if(this.support_css3_attr('backgroundSize') === false){ // old browsers need to do calculation to perform same output like "background-size: cover"
                this.nonCss3Supported_method(this.element, this.settings);
            }else{ // modern browsers that support CSS3 would be easier
                this.css3Supported_method(this.element, this.settings);
            }
        },

        kill: function(_this){
            if( $.data( _this, "plugin_" + pluginName )){

                if($(_this).prev().data('plugin') !== pluginName){
                    console.error('We could not find the element created by jqthumb. It is probably due to one or more element has been added right before the image element after the plugin initialization, or it was removed.');
                    return false;
                }

                $(_this).prev().remove();

                $(_this).removeAttr('style'); // first, remove all the styles first
                if(typeof $(_this).data('original-styles') !== 'undefined'){
                    $(_this).attr('style', $(_this).data('original-styles')); // then re-store the original styles
                }

                if(typeof $(_this).data('original-styles') !== 'undefined'){
                    $(_this).removeData('original-styles'); // remove data that stores the original stylings before the image being rendered
                }

                if(typeof $(_this).data('plugin_' + pluginName) !== 'undefined'){
                    $(_this).removeData('plugin_' + pluginName); // remove data that stored during plugin initialization
                }
            }
        },

        nonCss3Supported_method: function(_this, options){

            options.before.call(_this, _this);

            var that = this;

            $(_this).data('original-styles', $(_this).attr('style')); // keep original styles into data

            $(_this).hide();

            $(_this).one('load',function() {
                that.checkSrcAttrName(_this, options);

                var tempImg = $("<img/>").attr("src", $(_this).attr("src"));
                $(tempImg).load(function(){

                    var newImg = {
                            obj: tempImg,
                            size: {
                                width: this.width,
                                height: this.height
                            }
                        },
                        pw = that.percentOrPixel(options.width),
                        ph = that.percentOrPixel(options.height),
                        imgContainer = $('<div />'),
                        ratio = 0;

                    $(imgContainer)
                        .insertBefore($(_this))
                        .append($(newImg.obj))
                        .css({
                            'position'    : 'relative',
                            'overflow'    : 'hidden',
                            'width'        : (pw == '%') ? options.width : options.width + 'px',
                            'height'    : (ph == '%') ? options.height : options.height + 'px'
                        })
                        .data('plugin', pluginName); // it would be easy to kill later

                    if(newImg.size.width > newImg.size.height){ // horizontal

                        $(newImg.obj).css({
                            'width'            : 'auto',
                            'max-height'    : 99999999,
                            'min-height'    : 0,
                            'max-width'        : 99999999,
                            'min-width'        : 0,
                            'height'        : $(newImg.obj).parent().height() + 'px'
                        });

                        ratio = $(newImg.obj).height() / $(newImg.obj).width(); // get ratio

                        if( $(newImg.obj).width() < $(newImg.obj).parent().width() ){
                            $(newImg.obj).css({
                                'width': $(newImg.obj).parent().width(),
                                'height': parseFloat($(newImg.obj).parent().width() * ratio)
                            });
                        }

                    }else{ // vertical

                        $(newImg.obj).css({
                            'width'            : $(newImg.obj).parent().width() + 'px',
                            'max-height'    : 99999999,
                            'min-height'    : 0,
                            'max-width'        : 99999999,
                            'min-width'        : 0,
                            'height'        : 'auto'
                        });

                        ratio = $(newImg.obj).width() / $(newImg.obj).height(); // get ratio

                        if( $(newImg.obj).height() < $(newImg.obj).parent().height() ){
                            $(newImg.obj).css({
                                'width': parseFloat($(newImg.obj).parent().height() * ratio),
                                'height': $(newImg.obj).parent().height()
                            });
                        }
                    }

                    posTop = (that.percentOrPixel(options.position.top) == '%') ? options.position.top : options.position.top + 'px';
                    posLeft = (that.percentOrPixel(options.position.left) == '%') ? options.position.left : options.position.left + 'px';

                    $(newImg.obj).css({
                        'position'        : 'absolute',
                        'top'            : posTop,
                        'margin-top'    : function(){
                            if(that.percentOrPixel(options.position.top) == '%'){
                                return '-' + parseFloat(($(newImg.obj).height() / 100) * options.position.top.slice(0,-1)) + 'px';
                            }
                        },
                        'left'            : posLeft,
                        'margin-left'    : function(){
                            if(that.percentOrPixel(options.position.left) == '%'){
                                return '-' + parseFloat(($(newImg.obj).width() / 100) * options.position.left.slice(0,-1)) + 'px';
                            }
                        }
                    });

                    $(imgContainer)
                        .hide()
                        .addClass(options.classname);

                    if(options.showoncomplete === true){
                        $(imgContainer).show();
                    }
                    options.after.call(_this, $(imgContainer));

                    that.updateGlobal(_this, $(imgContainer), options);

                }).each(function(){

                    $(tempImg).load();

                });
            }).each(function(){

                $(_this).load();

            });
        },

        css3Supported_method: function (_this, options) {

            options.before.call(_this, _this);

            var that = this;

            $(_this).data('original-styles', $(_this).attr('style')); // keep original styles into data

            $(_this).hide();

            $(_this).one('load',function() {
                var pw = that.percentOrPixel(options.width),
                    ph = that.percentOrPixel(options.height),
                    featuredBgImgContainer,
                    featuredBgImg;

                featuredBgImgContainer = $('<div/>')
                                            .css({
                                                'width'   : (pw == '%') ? options.width : options.width + 'px',
                                                'height'  : (ph == '%') ? options.height : options.height + 'px',
                                                'display' : 'none'
                                            })
                                            .addClass(options.classname)
                                            .data('plugin', pluginName); // it would be easy to kill later

                featuredBgImg = $('<div/>').css({
                    'width'              : '100%',
                    'height'             : '100%',
                    'background-image'   : 'url("' + $(_this).attr(options.source) + '")',
                    '-ms-filter'         : '"progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+$(_this).attr(options.source)+'",sizingMethod="scale")',
                    'background-repeat'  : 'no-repeat',
                    'background-position': (function(){
                        var posTop = (that.percentOrPixel(options.position.top) == '%') ? options.position.top : options.position.top + 'px',
                            posLeft = (that.percentOrPixel(options.position.left) == '%') ? options.position.left : options.position.left + 'px';
                        return posTop + ' ' + posLeft;
                    })(),
                    'background-size'    : 'cover'
                })
                .appendTo($(featuredBgImgContainer));

                $(featuredBgImgContainer).insertBefore($(_this));

                if(options.showoncomplete === true){
                    $(featuredBgImgContainer).show();
                }

                that.checkSrcAttrName(_this, options);

                options.after.call(_this, $(featuredBgImgContainer));

                that.updateGlobal(_this, $(featuredBgImgContainer), options);

            }).each(function(){

                $(_this).load();

            });
        },

        updateGlobal: function(_this, obj, options){
            global.outputElems.push($(obj));
            global.elemCounter = global.elemCounter + 1;
            if(global.elemCounter == global.totalElems){
                options.done.call(_this, global.outputElems);
            }
        },

        checkSrcAttrName: function(_this, options){
            if(
                options.source != 'src' &&
                (
                    typeof $(_this).attr('src') === 'undefined' ||
                    $(_this).attr('src') === ''
                )
            )
            {
                $(_this).attr('src', $(_this).attr(options.source));
            }
        },

        percentOrPixel: function(str){
            str = str.toString();
            if(str.match("px$") || str.match("PX$") || str.match("pX$") || str.match("Px$")) {
                return 'px';
            }else if(str.match("%$")) {
                return '%';
            }
        },

        support_css3_attr: (function() {
            /* code available at http://net.tutsplus.com/tutorials/html-css-techniques/quick-tip-detect-css-support-in-browsers-with-javascript/ */
            var div = document.createElement('div'),
                vendors = 'Khtml Ms O Moz Webkit'.split(' '),
                len = vendors.length;

            return function(prop) {
                if ( prop in div.style ) return true;

                prop = prop.replace(/^[a-z]/, function(val) {
                    return val.toUpperCase();
                });

                for(i=0; i<vendors.length; i++){
                    if ( vendors[i] + prop in div.style ) {
                        return true;
                    }
                }
                return false;
            };
        })()
    };

    $.fn[ pluginName ] = function ( options ) {

        if($.isFunction($.fn.addBack) === false){ // we need to use addBack functions which only exists from jQuery v1.3 and above.
            $.fn.extend({
                addBack: function( selector ) {
                    return this.add( selector === null ?
                        this.prevObject : this.prevObject.filter(selector)
                    );
                }
            });
        }

        var elems = $(this).find('*').addBack();


        global.elemCounter = 0; // must always set to zero for every initialization
        global.outputElems = []; // must clear before doing anythong
        global.inputElems = $(elems);
        global.totalElems = $(elems).length; // set total of elements for later use.

        return this.each(function() {
            if(typeof options == 'string'){
                new Plugin( this, options );
            }else{
                if ( !$.data( this, "plugin_" + pluginName ) ) {
                    $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
                }else{ // re-rendered without killing it
                    new Plugin( this, 'kill' );
                    $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
                }
            }
        });
    };

})( jQuery, window, document );