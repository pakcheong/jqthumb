/*!
    jQThumb V2.3.0
    Copyright (c) 2013-2016
    Dual licensed under the MIT and GPL licenses.

    Author       : Pak Cheong
    Version      : 2.3.0
    Repo         : https://github.com/pakcheong/jqthumb
    Demo         : http://pakcheong.github.io/jqthumb/
    Last Updated : Monday, March 28th, 2016, 4:35:17 PM
    Requirements : jQuery >=v1.3.0 or Zepto (with zepto-data plugin) >=v1.0.0
*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        if ( '__proto__' in {} === ['jquery'] ) {
            define(['jquery'], factory);
        } else if ('__proto__' in {} === ['zepto'] ) {
            define(['zepto'], factory);
        } else {
            factory($);
        }
    } else {
        factory($);
    }
}(function ($) {
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

    function strToNum(str){
        return str.replace(/[^\d.-]/g, '');
    }

    function validateXYperc(val, wh){
        var temp = val.toString().match(/(-*)+\d+/)[0]; // '-200%' -> -200
        if(getMeasurement(val) == 'px'){
            if(val < 0){
                return 0;
            }else if(val > wh){
                return wh;
            }else{
                return val;
            }
        }else if(getMeasurement(val) == '%'){
            if(temp < 0){
                return '0%';
            }else if(temp > 100){
                return '100%';
            }else{
                return val;
            }
        }
    }

    function getMeasurement(str){ // determine if input is a PX or % value
        var ma = str.toString().match(/\d+(.*)/i);
        if(ma){
            switch($.trim(ma[1])){
                case '':
                    return 'px';
                case 'px':
                    return 'px';
                case '%':
                    return '%';
                default:
                    break;
            }
        }
    }

    var css3Supported = (function(){
        /* code available at http://net.tutsplus.com/tutorials/html-css-techniques/quick-tip-detect-css-support-in-browsers-with-javascript/ */
        var div     = document.createElement('div'),
            vendors = 'Khtml Ms O Moz Webkit'.split(' '),
            len     = vendors.length;

        return function(prop) {
            if ( prop in div.style ) return true;

            prop = prop.replace(/^[a-z]/, function(val) {
                return val.toUpperCase();
            });

            for(var i in vendors){
                if ( vendors[i] + prop in div.style ) {
                    return true;
                }
            }
            return false;
        };
    })();

    var checkPositionReach = function($elem, scrollCheck){
        var $tempWrapper  = $elem,
            docViewTop    = $window.scrollTop(),
            docViewBottom = docViewTop + $window.height(),
            elemTop       = $tempWrapper.offset().top,
            elemBottom    = elemTop + $tempWrapper.height();
        scrollCheck = (!scrollCheck) ? scrollCheck : 0;
        return ((elemBottom - scrollCheck <= docViewBottom) && (elemTop >= docViewTop));
    };

    var pluginName             = 'jqthumb',
        $window                = $(window),
        resizeDataName         = pluginName + '-resize',
        onDemandEventNames     = 'load.' + pluginName + ' scroll.' + pluginName + ' resize.' + pluginName + ' scrollstop.' + pluginName,
        onDemandEventHandlerFn = null,
        renderPosDataName      = pluginName + '-render-position',
        oriStyleDataName       = pluginName + '-original-styles',
        onScrDataName          = pluginName + '-onscreen',
        dtOption               = pluginName + '-options',
        grandGlobal            = { outputElems: [], inputElems: [] },
        defaults               = {
                                    classname      : pluginName,
                                    width          : 100,
                                    height         : 100,
                                    position       : { x: '50%', y: '50%' },
                                    source         : 'src',
                                    responsive     : 20,
                                    zoom           : 1,
                                    show           : true,
                                    renderPosition : 'before', // before, after
                                    ondemand       : false,
                                    scrollCheck    : 0,
                                    method         : 'auto', // auto, modern, native
                                    reinit         : true, // true, false
                                    before         : function(){},
                                    after          : function(){},
                                    done           : function(){}
                                };

    function Plugin ( element, options ) {// The actual plugin constructor
        $.fn[pluginName].defaults = $.extend( {}, defaults, $.fn[pluginName].defaults );
        this.element              = element;
        this.settings             = $.extend( {}, $.fn[pluginName].defaults, options );
        this.settings.scrollCheck = this.settings.scrollCheck.toString().replace(/px/gi, '');
        this.settings.width       = this.settings.width.toString().replace(/px/gi, '');
        this.settings.height      = this.settings.height.toString().replace(/px/gi, '');
        this.settings.position.y  = validateXYperc(this.settings.position.y, this.settings.width);
        this.settings.position.x  = validateXYperc(this.settings.position.x, this.settings.height);
        this.settings.zoom        = (this.settings.zoom < 0) ? 0 : this.settings.zoom;

        if(typeof options == 'string'){
            if(options.toLowerCase() == 'kill'){
                this.kill(this.element);
            }
        }else{
            $(this.element).data(dtOption, this.settings);
            this.init();
        }
    }

    Plugin.prototype = {
        init: function () {
            var method = this.settings.method.toLowerCase();
            if(method == 'auto'){
                if(css3Supported('backgroundSize') === false){ // old browsers need to do calculation to perform same output like "background-size: cover"
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

            if($this.data(pluginName)){
                var tempArr = [],
                    $thumb = (function(){
                                    if($this.data(renderPosDataName) === 'after'){
                                        return $this.next();
                                    }
                                    return $this.prev();
                                })();

                if($thumb && $thumb.data(pluginName) !== pluginName){
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
                    $window.unbind('resize', $thumb.data(resizeDataName));
                    $thumb.removeData(resizeDataName);
                }
                $window.unbind(onDemandEventNames, onDemandEventHandlerFn);
                /* END: remove attached custom event */

                $thumb.remove();

                $this.removeAttr('style'); // first, remove all the styles first
                if(!$this.data(oriStyleDataName)){
                    $this.attr('style', $this.data(oriStyleDataName)); // then re-store the original styles
                    $this.removeData(oriStyleDataName); // remove data that stores the original stylings before the image being rendered
                }

                if($this.data(pluginName)){
                    $this.removeData(pluginName); // remove data that stored during plugin initialization
                }

                if($this.data(dtOption)){
                    $this.removeData(dtOption); // remove data that stored during plugin initialization
                }

                if($this.data(onScrDataName)){
                    $this.removeData(onScrDataName); // remove data that stored during plugin initialization
                }

                if($this.data(renderPosDataName)){
                    $this.removeData(renderPosDataName); // remove data that stored during plugin initialization
                }
            }
        },

        native: function(_this, options){

            options.before.apply(_this, [_this]);

            function loadImg($this, imgUrl, cb){
                var $tempImg = $('<img/>');
                $tempImg.bind('load', function(){
                    var newImg        = {
                                            obj: $tempImg,
                                            size: {
                                                width  : this.width,
                                                height : this.height
                                            }
                                        },
                        pw            = getMeasurement(options.width),
                        ph            = getMeasurement(options.height),
                        optResp       = options.responsive,
                        $newImgObj    = $(newImg.obj),
                        $imgContainer = $('<div />'),
                        ratio         = 0,
                        resizeThumb   = function(){ // custom event for $(window).resize()
                                            setTimeout(function(){
                                                calculateReso();
                                            }, optResp);
                                        },
                        calculateReso = function(){
                                            var $newImgObjContainer      = $newImgObj.parent(),
                                                newImgObjContainerHeight = $newImgObjContainer.height(),
                                                newImgObjContainerWidth  = $newImgObjContainer.width(),
                                                optZ                     = options.zoom,
                                                optPosX                  = options.position.x,
                                                optPosY                  = options.position.y;

                                            if(newImg.size.width > newImg.size.height){ // horizontal

                                                $newImgObj.css({
                                                    'width'      : 'auto',
                                                    'max-height' : 99999999,
                                                    'min-height' : 0,
                                                    'max-width'  : 99999999,
                                                    'min-width'  : 0,
                                                    'height'     : newImgObjContainerHeight + 'px'
                                                });

                                                ratio = $newImgObj.height() / $newImgObj.width(); // get ratio

                                                if($newImgObj.width() < newImgObjContainerWidth){
                                                    $newImgObj.css({
                                                        'width' : newImgObjContainerWidth * optZ,
                                                        'height': parseFloat(newImgObjContainerWidth * ratio) * optZ
                                                    });
                                                }else{
                                                    $newImgObj.css({
                                                        'width' : $newImgObj.width() * optZ,
                                                        'height': parseFloat($newImgObj.width() * ratio) * optZ
                                                    });
                                                }

                                            }else{ // vertical

                                                $newImgObj.css({
                                                    'width'      : newImgObjContainerWidth + 'px',
                                                    'max-height' : 99999999,
                                                    'min-height' : 0,
                                                    'max-width'  : 99999999,
                                                    'min-width'  : 0,
                                                    'height'     : 'auto'
                                                });

                                                ratio = $newImgObj.width() / $newImgObj.height(); // get ratio

                                                if($newImgObj.height() < newImgObjContainerHeight){
                                                    $newImgObj.css({
                                                        'width' : parseFloat(newImgObjContainerHeight * ratio) * optZ,
                                                        'height': newImgObjContainerHeight * optZ
                                                    });
                                                }

                                            }

                                            if(options.zoom < 1){ // workaround for zoom level < 1
                                                var $subContainer = $('<div />'),
                                                    optStrW       = options.width.toString(),
                                                    optStrH       = options.height.toString(),
                                                    mW            = getMeasurement(optStrW),
                                                    mH            = getMeasurement(optStrH);

                                                $subContainer
                                                    .css({
                                                        'width'    : parseFloat(strToNum(optStrW) * options.zoom) + mW,
                                                        'height'   : parseFloat(strToNum(optStrH) * options.zoom) + mH,
                                                        'position' : 'relative',
                                                        'overflow' : 'hidden'
                                                    })
                                                    .appendTo($newImgObj.parent());

                                                $newImgObj.appendTo($subContainer); // move $newImgObj into $subContainer
                                            }

                                            $newImgObj.css({
                                                'position'    : 'absolute',
                                                'left'        : (function(){
                                                    var x = 0;
                                                    if(getMeasurement(optPosX) == '%'){
                                                        x = parseFloat(($newImgObj.width() - $newImgObj.parent().width()) / 100 * strToNum(optPosX));
                                                        return (x <= 0) ? x + 'px' : '-' + x + 'px';
                                                    }else if(getMeasurement(optPosX) == 'px' || isNaN(optPosX) === false){
                                                        return strToNum(optPosX) + 'px';
                                                    }
                                                })(),
                                                'top'         : (function(){
                                                    var y = 0;
                                                    if(getMeasurement(optPosY) == '%'){
                                                        y = parseFloat(($newImgObj.height() - $newImgObj.parent().height()) / 100 * strToNum(optPosY));
                                                        return (y <= 0) ? y + 'px' : '-' + y + 'px';
                                                    }else if(getMeasurement(optPosY) == 'px' || isNaN(optPosY) === false){
                                                        return strToNum(optPosY) + 'px';
                                                    }
                                                })()
                                            });
                                        };

                    if(options.renderPosition.toLowerCase() === 'after'){
                        $imgContainer.insertAfter($this);
                    }else{
                        $imgContainer.insertBefore($this);
                    }

                    $imgContainer
                        .append($newImgObj)
                        .css({
                            'position' : 'relative',
                            'overflow' : 'hidden',
                            'width'    : strToNum(options.width) + getMeasurement(options.width),
                            'height'   : strToNum(options.height) + getMeasurement(options.height)
                        })
                        .data(pluginName, pluginName); // it would be easy to kill later

                    calculateReso();

                    if(!isNaN(optResp) && optResp > 0){
                        $imgContainer.data(resizeDataName, resizeThumb); // keep function into data for killing purpose later
                        $window.bind('resize', $imgContainer.data(resizeDataName));
                    }

                    $imgContainer
                        .hide()
                        .addClass(options.classname);

                    if(options.show === true){
                        $imgContainer.show();
                    }

                    if (typeof cb === 'function'){
                        cb($imgContainer);
                    }

                }).attr('src', $this.attr(options.source)); // for older browsers, must bind events first then set attr later (IE7, IE8)
            }

            var that   = this,
                $this  = $(_this),
                imgUrl = $this.attr(options.source);
            onDemandEventHandlerFn = function(){ // check scroll position
                                        var readyToLoad = checkPositionReach($this.parent(), options.scrollCheck);
                                        if(readyToLoad && !$this.data(onScrDataName)){
                                            $this.data(onScrDataName, true);
                                            $this.unwrap(); // remove temporary tag
                                            loadImg($this, imgUrl, function($imgContainer){
                                                options.after.apply(_this, [$imgContainer]);
                                                that.updateGlobal(_this, $imgContainer, options);
                                            });
                                        }
                                    };

            $this.data(oriStyleDataName, $this.attr('style')); // keep original styles into data
            $this.data(renderPosDataName, options.renderPosition); // store render position (before/after) for killing purpose

            $this.hide();

            if(options.ondemand === true){
                $this.wrap('<div />'); // add temporary tag to get its offset().top
                $window.bind(onDemandEventNames, onDemandEventHandlerFn);
                onDemandEventHandlerFn();
            }else{
                loadImg($this, imgUrl, function($imgContainer){
                    options.after.apply(_this, [$imgContainer]);
                    that.updateGlobal(_this, $imgContainer, options);
                });
            }
        },

        modern: function (_this, options) {

            function loadImg($oriImage, imgUrl, cb, debug){

                $tempImg = $('<img />').attr('src', imgUrl);

                $.each($tempImg, function(index, obj){
                    var $tempImg = $(obj);

                    $tempImg.one('load', function() {

                        var optW                    = options.width,
                            optH                    = options.height,
                            optZ                    = options.zoom,
                            optPosX                 = options.position.x,
                            optPosY                 = options.position.y,
                            $featuredBgImgContainer = null,
                            $featuredBgImg          = null;

                        $featuredBgImgContainer = $('<div/>')
                                                    .css({
                                                        'width'    : strToNum(optW) + getMeasurement(optW),
                                                        'height'   : strToNum(optH) + getMeasurement(optH),
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
                                                'background-image'   : 'url("' + imgUrl + '")',
                                                // '-ms-filter'         : '"progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + $oriImage.attr(options.source) + '",sizingMethod="scale")', // this does not work in Zepto
                                                'background-repeat'  : 'no-repeat',
                                                'background-position': strToNum(optPosX) + getMeasurement(optPosX) + ' ' + strToNum(optPosY) + getMeasurement(optPosY),
                                                'background-size'    : 'cover'
                                            })
                                            .appendTo($featuredBgImgContainer);

                        if(options.renderPosition.toLowerCase() === 'after'){
                            $featuredBgImgContainer.insertAfter($oriImage);
                        }else{
                            $featuredBgImgContainer.insertBefore($oriImage);
                        }

                        $featuredBgImgContainer.show(); // must show to get resolution
                        $featuredBgImg
                            .css({
                                'width'    : parseFloat(100 * optZ) + '%',
                                'height'   : parseFloat(100 * optZ) + '%',
                                'position' : 'absolute'
                            })
                            .css({ // cannot combine css() as width and height have to be defined before doing calculation
                                'top'      : (function(){
                                    // (cH - pH) / pH * 100 / percentage
                                    var cH = $featuredBgImgContainer.height(),
                                        pH = $featuredBgImg.height();
                                    if(getMeasurement(optPosY) == '%'){
                                        return '-' + parseFloat((pH - cH) / cH * 100 / (100 / strToNum(optPosY) ) ) + '%';
                                    }
                                })(),
                                'left'     : (function(){
                                    // (cW - pW) / cW * 100 / percentage
                                    var cW = $featuredBgImgContainer.width(),
                                        pW = $featuredBgImg.width();
                                    if(getMeasurement(optPosX) == '%'){
                                        return '-' + parseFloat((pW - cW) / cW * 100 / (100 / strToNum(optPosX) ) ) + '%';
                                    }
                                })()
                            });

                        $featuredBgImgContainer.hide();

                        if(options.show === true){
                            $featuredBgImgContainer.show();
                        }

                        if (typeof cb === 'function'){
                            cb($featuredBgImgContainer);
                        }
                    });
                });
            }

            options.before.apply(_this, [_this]);

            var that      = this,
                $oriImage = $(_this),
                imgUrl    = $oriImage.attr(options.source);
            onDemandEventHandlerFn = function(){ // check scroll position
                                        var readyToLoad = checkPositionReach($oriImage.parent(), options.scrollCheck);
                                        if(readyToLoad && !$oriImage.data(onScrDataName)){
                                            $oriImage.data(onScrDataName, true);
                                            $oriImage.unwrap(); // remove temporary tag
                                            loadImg($oriImage, imgUrl, function($featuredBgImgContainer){
                                                options.after.apply(_this, [$featuredBgImgContainer]);
                                                that.updateGlobal(_this, $featuredBgImgContainer, options);
                                            }, true);
                                        }
                                    };

            $oriImage.data(oriStyleDataName, $oriImage.attr('style')); // keep original styles into data
            $oriImage.data(renderPosDataName, options.renderPosition); // store render position (before/after) for killing purpose

            $oriImage.hide();

            if(options.ondemand === true){
                $oriImage.wrap('<div />'); // add temporary tag to get its offset().top
                $window.bind(onDemandEventNames, onDemandEventHandlerFn);
                onDemandEventHandlerFn();
            }else{
                loadImg($oriImage, imgUrl, function($featuredBgImgContainer){
                    options.after.apply(_this, [$featuredBgImgContainer]);
                    that.updateGlobal(_this, $featuredBgImgContainer, options);
                });
            }
        },

        updateGlobal: function(_this, obj, options){
            _this.global.outputElems.push( $(obj)[0] );
            _this.global.elemCounter++;
            grandGlobal.outputElems.push( $(obj)[0] );
            if(_this.global.elemCounter == _this.global.inputElems.length){
                options.done.apply(_this, [_this.global.outputElems]);
            }
        }
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

        if(!$.fn.unwrap){
            $.fn.unwrap = function(){
                this.parent().each(function() {
                    if ( !$.nodeName( this, 'body' ) ) {
                        $( this ).replaceWith( this.childNodes );
                    }
                }).end();
            };
        }

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
                if (!$eachImg.data(pluginName)){ // newly render
                    $eachImg.data(pluginName, new Plugin( this, options ));
                }else{ // re-rendered without killing it
                    if($eachImg.data(dtOption) && $eachImg.data(dtOption).reinit === true){
                        new Plugin(this, 'kill');
                        $eachImg.data(pluginName, new Plugin( this, options ));
                    }
                }
            }
        });
    };

    $.fn[pluginName].defaults = defaults;
}));