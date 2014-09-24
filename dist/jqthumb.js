/*!
    jQThumb V2.1.3
    Copyright (c) 2013-2014
    Dual licensed under the MIT and GPL licenses.

    Author       : Pak Cheong
    Version      : 2.1.3
    Repo         : https://github.com/pakcheong/jqthumb
    Demo         : http://pakcheong.github.io/jqthumb/
    Last Updated : Wednesday, September 24th, 2014, 12:11:05 PM
    Requirements : jQuery >=v1.3.0 or Zepto (with zepto-data plugin) >=v1.0.0
*/
;(function ( $, window, document, undefined ) {

    function log(type, msg){
        if(window.console){
            if(typeof type != 'undefined' && type && typeof msg != 'undefined' && msg){
                type = type.toLowerCase();
                if(type == 'error'){
                    console.error(msg);
                }else if(type == 'log'){
                    console.log(msg);
                }else{
                    console.error('"' + type + '" is not supported as console type.');
                }
            }
        }
    }

    var pluginName       = 'jqthumb',
        resizeDataName   = pluginName + '-resize',
        oriStyleDataName = pluginName + '-original-styles',
        grandGlobal      = { outputElems: [], inputElems: [] },
        defaults         = {
            classname  : 'jqthumb',
            width      : 100,
            height     : 100,
            position   : { x: '50%', y: '50%' },
            source     : 'src',
            responsive : 20,
            zoom       : 1,
            show       : true,
            method     : 'auto', // auto, modern, native
            before     : function(){},
            after      : function(){},
            done       : function(){}
        };

    function Plugin ( element, options ) {// The actual plugin constructor
        this.element             = element;
        this.settings            = $.extend( {}, defaults, options );
        this.settings.width      = this.settings.width.toString().replace(/px/g, '');
        this.settings.height     = this.settings.height.toString().replace(/px/g, '');
        this.settings.position.y = this.settings.position.y.toString().replace(/px/g, '');
        this.settings.position.x = this.settings.position.x.toString().replace(/px/g, '');
        this._defaults           = defaults;
        this._name               = pluginName;
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
            var method = this.settings.method.toLowerCase();
            if(method == 'auto'){
                if(this.css3_supported('backgroundSize') === false){ // old browsers need to do calculation to perform same output like "background-size: cover"
                    this.native(this.element, this.settings);
                }else{ // modern browsers that support CSS3 would be easier
                    this.modern(this.element, this.settings);
                }
            }else if(method == 'modern'){
                this.modern(this.element, this.settings);
            }else if(method == 'native'){
                this.native(this.element, this.settings);
            }else{
                log('error', 'Invalid method. Only "auto", "modern" and "native" are allowed.');
            }
        },

        kill: function(_this){
            var $this = $(_this);

            if( $this.data(pluginName)){
                var tempArr = [],
                    $thumb = $this.prev();

                if($thumb.data(pluginName) !== pluginName){
                    log('error', 'Could not find the element. It is probably due to one or more element has been added right before the image element after the plugin initialization or it was removed.');
                    return false;
                }

                /* START: remove output elements */
                tempArr = [];
                $.each(grandGlobal.outputElems, function(index, obj){
                    if($(obj)[0] != $thumb[0]){
                        tempArr.push(grandGlobal.outputElems[index]);
                    }
                });
                grandGlobal.outputElems = tempArr;
                /* END: remove output elements */

                /* START: remove input elements */
                tempArr = [];
                $.each(grandGlobal.inputElems, function(index, obj){
                    if($(obj)[0] != $this[0]){
                        tempArr.push(grandGlobal.inputElems[index]);
                    }
                });
                grandGlobal.inputElems = tempArr;
                /* END: remove input elements */

                /* START: remove attached custom event */
                if($thumb.data(resizeDataName)){
                    $(window).unbind('resize', $thumb.data(resizeDataName));
                    $thumb.removeData(resizeDataName);
                }
                /* END: remove attached custom event */

                $thumb.remove();

                $this.removeAttr('style'); // first, remove all the styles first
                if(typeof $this.data(oriStyleDataName) !== 'undefined'){
                    $this.attr('style', $this.data(oriStyleDataName)); // then re-store the original styles
                    $this.removeData(oriStyleDataName); // remove data that stores the original stylings before the image being rendered
                }

                if(typeof $this.data(pluginName) !== 'undefined'){
                    $this.removeData(pluginName); // remove data that stored during plugin initialization
                }
            }
        },

        native: function(_this, options){

            options.before.call(_this, _this);

            var that  = this,
                $this = $(_this),
                $tempImg = $('<img/>');

            $this.data(oriStyleDataName, $this.attr('style')); // keep original styles into data

            $this.hide();

            $tempImg.bind('load', function(){
                var newImg        = {
                                        obj: $tempImg,
                                        size: {
                                            width: this.width,
                                            height: this.height
                                        }
                                    },
                    pw            = that.percOrPix(options.width),
                    ph            = that.percOrPix(options.height),
                    $newImgObj    = $(newImg.obj),
                    $imgContainer = $('<div />'),
                    ratio         = 0,
                    resizeThumb   = function(){
                                        setTimeout(function(){
                                            calculateReso();
                                        }, options.responsive);
                                    },
                    calculateReso = function(){
                                        var $newImgObjContainer = $newImgObj.parent();

                                        if(newImg.size.width > newImg.size.height){ // horizontal

                                            $newImgObj.css({
                                                'width'      : 'auto',
                                                'max-height' : 99999999,
                                                'min-height' : 0,
                                                'max-width'  : 99999999,
                                                'min-width'  : 0,
                                                'height'     : $newImgObjContainer.height() + 'px'
                                            });

                                            ratio = $newImgObj.height() / $newImgObj.width(); // get ratio

                                            if( $newImgObj.width() < $newImgObjContainer.width() ){
                                                $newImgObj.css({
                                                    'width' : $newImgObjContainer.width() * options.zoom,
                                                    'height': parseFloat($newImgObjContainer.width() * ratio) * options.zoom
                                                });
                                            }else{
                                                $newImgObj.css({
                                                    'width' : $newImgObj.width() * options.zoom,
                                                    'height': parseFloat($newImgObj.width() * ratio) * options.zoom
                                                });
                                            }

                                        }else{ // vertical

                                            $newImgObj.css({
                                                'width'      : $newImgObjContainer.width() + 'px',
                                                'max-height' : 99999999,
                                                'min-height' : 0,
                                                'max-width'  : 99999999,
                                                'min-width'  : 0,
                                                'height'     : 'auto'
                                            });

                                            ratio = $newImgObj.width() / $newImgObj.height(); // get ratio

                                            if( $newImgObj.height() < $newImgObjContainer.height() ){
                                                $newImgObj.css({
                                                    'width' : parseFloat($newImgObjContainer.height() * ratio) * options.zoom,
                                                    'height': $newImgObjContainer.height() * options.zoom
                                                });
                                            }
                                        }

                                        $newImgObj.css({
                                            'position'    : 'absolute',
                                            'left'        : (function(){
                                                var x = 0;
                                                if(that.percOrPix(options.position.x) == '%'){
                                                    x = parseFloat(($newImgObj.width() - $imgContainer.width()) / 100 * options.position.x.replace('%', ''));
                                                    return (x <= 0) ? x : '-' + x;
                                                }else if(that.percOrPix(options.position.x) == 'px' || isNaN(options.position.x) === false){
                                                    x = options.position.x.replace('px', '');
                                                    return x;
                                                }
                                            })(),
                                            'top'         : (function(){
                                                var y = 0;
                                                if(that.percOrPix(options.position.y) == '%'){
                                                    y = parseFloat(($newImgObj.height() - $imgContainer.height()) / 100 * options.position.y.replace('%', ''));
                                                    return (y <= 0) ? y : '-' + y;
                                                }else if(that.percOrPix(options.position.y) == 'px' || isNaN(options.position.y) === false){
                                                    y = options.position.y.replace('px', '');
                                                    return y;
                                                }
                                            })()
                                        });
                                    };

                $imgContainer
                    .insertBefore($this)
                    .append($newImgObj)
                    .css({
                        'position' : 'relative',
                        'overflow' : 'hidden',
                        'width'    : (pw == '%') ? options.width : options.width + 'px',
                        'height'   : (ph == '%') ? options.height : options.height + 'px'
                    })
                    .data(pluginName, pluginName); // it would be easy to kill later

                calculateReso();

                if(options.responsive > 0){
                    $imgContainer.data(resizeDataName, resizeThumb); // keep function into data for killing purpose later
                    $(window).bind('resize', $imgContainer.data(resizeDataName));
                }

                $imgContainer
                    .hide()
                    .addClass(options.classname);

                if(options.show === true){
                    $imgContainer.show();
                }
                options.after.call(_this, $imgContainer);

                that.updateGlobal(_this, $imgContainer, options);

            }).attr('src', $this.attr(options.source)); // for older browsers, must bind events first then set attr later (IE7, IE8)
        },

        modern: function (_this, options) {
            options.before.call(_this, _this);

            var that = this,
                $oriImage = $(_this),
                $tempImg = $('<img />').attr('src', $oriImage.attr(options.source));

            $oriImage.data(oriStyleDataName, $oriImage.attr('style')); // keep original styles into data

            $oriImage.hide();

            $.each($tempImg, function(index, obj){
                var $tempImg = $(obj);

                $tempImg.one('load', function() {
                    var pw                      = that.percOrPix(options.width),
                        ph                      = that.percOrPix(options.height),
                        $featuredBgImgContainer = null,
                        $featuredBgImg          = null;

                    $featuredBgImgContainer = $('<div/>')
                                                .css({
                                                    'width'    : (pw == '%') ? options.width : options.width + 'px',
                                                    'height'   : (ph == '%') ? options.height : options.height + 'px',
                                                    'display'  : 'none',
                                                    'position' : 'relative',
                                                    'overflow' : 'hidden'
                                                })
                                                .addClass(options.classname)
                                                .data(pluginName, pluginName); // it would be easy to kill later

                    $featuredBgImg = $('<div/>')
                                        .css({
                                            'width'              : '100%',
                                            'height'             : '100%',
                                            'background-image'   : 'url("' + $oriImage.attr(options.source) + '")',
                                            // '-ms-filter'         : '"progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + $oriImage.attr(options.source) + '",sizingMethod="scale")', // this does not work in Zepto
                                            'background-repeat'  : 'no-repeat',
                                            'background-position': (function(){
                                                var x = (that.percOrPix(options.position.x) == '%') ? options.position.x : options.position.x + 'px',
                                                    y = (that.percOrPix(options.position.y) == '%') ? options.position.y : options.position.y + 'px';
                                                return x + ' ' + y;
                                            })(),
                                            'background-size'    : 'cover'
                                        })
                                        .appendTo($featuredBgImgContainer);

                    $featuredBgImgContainer.insertBefore($(_this));

                    if(options.zoom != 1){
                        $featuredBgImgContainer.show(); // must show to get resolution
                        $featuredBgImg
                            .css({
                                'width'    : parseFloat(100 * options.zoom) + '%',
                                'height'   : parseFloat(100 * options.zoom) + '%',
                                'position' : 'absolute'
                            })
                            .css({ // cannot combine css() as width and height have to be defined before doing calculation
                                'top'      : (function(){
                                    // (cH - pH) / pH * 100 / percentage
                                    var cH = $featuredBgImgContainer.height(),
                                        pH = $featuredBgImg.height();
                                    if(that.percOrPix(options.position.y) == '%'){
                                        return '-' + parseFloat((pH - cH) / cH * 100 / (100 / options.position.y.replace('%', '')) ) + '%';
                                    }
                                })(),
                                'left'     : (function(){
                                    // (cW - pW) / cW * 100 / percentage
                                    var cW = $featuredBgImgContainer.width(),
                                        pW = $featuredBgImg.width();
                                    if(that.percOrPix(options.position.x) == '%'){
                                        return '-' + parseFloat((pW - cW) / cW * 100 / (100 / options.position.x.replace('%', '')) ) + '%';
                                    }
                                })()
                            });
                        $featuredBgImgContainer.hide();
                    }

                    if(options.show === true){
                        $featuredBgImgContainer.show();
                    }

                    that.checkSrcAttrName(_this, options);

                    options.after.call(_this, $featuredBgImgContainer);

                    that.updateGlobal(_this, $featuredBgImgContainer, options);
                });
            });
        },

        updateGlobal: function(_this, obj, options){
            _this.global.outputElems.push( $(obj)[0] );
            _this.global.elemCounter++;
            grandGlobal.outputElems.push( $(obj)[0] );
            if(_this.global.elemCounter == _this.global.inputElems.length){
                options.done.call(_this, _this.global.outputElems);
            }
        },

        checkSrcAttrName: function(_this, options){
            var $_this = $(_this);
            if(
                options.source != 'src' &&
                (
                    typeof $_this.attr('src') === 'undefined' ||
                    $_this.attr('src') === ''
                )
            )
            {
                $_this.attr('src', $_this.attr(options.source));
            }
        },

        percOrPix: function(str){
            str = str.toString();
            if(str.match("px$") || str.match("PX$") || str.match("pX$") || str.match("Px$")) {
                return 'px';
            }else if(str.match("%$")) {
                return '%';
            }
        },

        css3_supported: (function() {
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

        var obj    = {},
            global = {
                        elemCounter : 0,
                        outputElems : [],
                        inputElems  : (function(_this){
                                            var $this   = $(_this),
                                                total   = $this.length,
                                                tempArr = [];
                                            for(var i=0; i<total; i++){
                                                tempArr.push($this.get(i));
                                            }
                                            return tempArr;
                                        })($(this))
                    };

        obj[pluginName] = function(action){
            if(typeof action == 'undefined'){
                log('error', 'Please specify an action like $.' + pluginName + '("killall")');
                return;
            }
            action = action.toLowerCase();
            if(action == 'killall'){
                $.each(grandGlobal.inputElems, function(){
                    new Plugin(this, 'kill');
                });
            }
        };
        
        $.extend($, obj);

        return this.each(function() {

            var $eachImg = $(this);
            this.global = global;

            grandGlobal.inputElems.push($eachImg);

            if(typeof options == 'string'){
                new Plugin(this, options);
            }else{
                if (!$eachImg.data(pluginName)){
                    $eachImg.data(pluginName, new Plugin( this, options ));
                }else{ // re-rendered without killing it
                    new Plugin(this, 'kill');
                    $eachImg.data(pluginName, new Plugin( this, options ));
                }
            }
        });
    };

})( (window.jQuery || window.Zepto), window, document );