/*!
    jQThumb V2.3.0
    Copyright (c) 2013-2016
    Released under the MIT license.

    Author       : Pak Cheong
    Version      : 2.3.0
    Repo         : git@github.com:pakcheong/jqthumb.git
    Demo         : http://pakcheong.github.io/jqthumb/
    Last Updated : Friday, April 1st, 2016, 3:54:27 PM
    Requirements : jQuery >=v1.3.0 or Zepto (with zepto-data plugin) >=v1.0.0
*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD (Register as an anonymous module)
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory((function(){
            if (typeof jQuery !== 'undefined') {
                return jQuery;
            } else if (Zepto !== 'undefined') {
                return Zepto;
            }
            return $;
        })());
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
        str = $.trim(str.toString());
        if(str.toLowerCase() === 'auto'){
            return str;
        }
        return Number(str.replace(/[^\d.-]/g, ''));
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
        return '';
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

    /*
        Zepto does not come with $.fn.outerWidth() & $.fn.outerHeight()
        code: https://gist.github.com/pamelafox/1379704
    */
    if (!$.fn.outerHeight || !$.fn.outerWidth) {
        if (typeof Array.prototype.forEach != 'function') { // fix for older browsers
            Array.prototype.forEach = function(callback){
                for (var i = 0; i < this.length; i++){
                    callback.apply(this, [this[i], i, this]);
                }
            };
        }
        ['width', 'height'].forEach(function(dimension) {
            var offset, Dimension = dimension.replace(/./, function(m) { return m[0].toUpperCase(); });
            if (!$.fn['outer' + Dimension]) {
                $.fn['outer' + Dimension] = function() {
                    var elem = this;
                    if (elem) {
                        var size = elem[dimension]();
                        var sides = { 'width': ['left', 'right'], 'height': ['top', 'bottom'] };
                        sides[dimension].forEach(function(side) {
                            size += parseInt(elem.css('margin-' + side), 10);
                            size += parseInt(elem.css('padding-' + side), 10);
                            size += parseInt(elem.css('border-' + side + '-width'), 10);
                        });
                        return size;
                    } else {
                        return null;
                    }
                };
            }
        });
    }

    var checkPositionReach = function($elem, scrollCheck){
        var $win     = $(window),
            bounds   = $elem.offset(),
            viewport = {
                            top  : $win.scrollTop(),
                            // left : $win.scrollLeft() // Zepto does not support this
                            left : window.scrollX
                        };
        viewport.right  = viewport.left + $win.width();
        viewport.bottom = viewport.top + $win.height();
        bounds.right    = bounds.left + $elem.outerWidth();
        bounds.bottom   = bounds.top + $elem.outerHeight();
        scrollCheck     = (scrollCheck) ? strToNum(scrollCheck) : 0;

        return (!(
            viewport.right  < (bounds.left   - scrollCheck) || 
            viewport.left   > (bounds.right  + scrollCheck) || 
            viewport.bottom < (bounds.top    - scrollCheck) || 
            viewport.top    > (bounds.bottom + scrollCheck)
        ));
    };

    var pluginName                       = 'jqthumb',
        $window                          = $(window),
        resizeDataName                   = pluginName + '-resize',
        onDemandScrollEventObj           = (function(){
                                                var tmp = ['scroll', 'resize', 'scrolltop'];
                                                var obj = {};
                                                for(var i=0; i<tmp.length; i++){
                                                    obj[tmp[i]] = tmp[i] + '.' + pluginName;
                                                }
                                                return obj;
                                            })(),
        onDemandScrollEventStr           = (function(){
                                                var tmp = [];
                                                $.each(onDemandScrollEventObj, function(key, val){
                                                    tmp.push(key + '.' + val);
                                                });
                                                return tmp.join(' ');
                                            })(),
        onDemandScrollEventHandlerFn     = null,
        onDemandClickEventName           = 'click.' + pluginName,
        onDemandClickEventHandlerFn      = null,
        onDemandMouseEnterEventName      = 'mouseenter.' + pluginName,
        onDemandMouseEnterEventHandlerFn = null,
        renderPosDataName                = pluginName + '-render-position',
        oriStyleDataName                 = pluginName + '-original-styles',
        onScrDataName                    = pluginName + '-onscreen',
        dtOption                         = pluginName + '-options',
        grandGlobal                      = { outputElems: [], inputElems: [] },
        defaults                         = {
                                                classname           : pluginName,
                                                width               : 100,
                                                height              : 100,
                                                position            : { x: '50%', y: '50%' },
                                                source              : 'src',
                                                responsive          : 20,
                                                zoom                : 1,
                                                show                : true,
                                                renderPosition      : 'before', // before, after
                                                onDemand            : false,
                                                onDemandEvent       : 'scroll',
                                                onDemandScrollCheck : 0,
                                                method              : 'auto', // auto, modern, native
                                                reinit              : true, // true, false
                                                before              : function(){},
                                                after               : function(){},
                                                done                : function(){}
                                            };

    function Plugin ( element, options ) {// The actual plugin constructor
        $.fn[pluginName].defaults         = $.extend( {}, defaults, $.fn[pluginName].defaults );
        this.element                      = element;
        this.settings                     = $.extend( {}, $.fn[pluginName].defaults, options );
        this.settings.onDemandEvent       = this.settings.onDemandEvent.toLowerCase();
        this.settings.onDemandScrollCheck = this.settings.onDemandScrollCheck.toString().replace(/px/gi, '');
        this.settings.width               = this.settings.width.toString().replace(/px/gi, '');
        this.settings.height              = this.settings.height.toString().replace(/px/gi, '');
        if(!this.settings.width){
            options.width = defaults.width;
            this.settings.width = defaults.width;
        }
        if(!this.settings.height){
            options.height = defaults.height;
            this.settings.height = defaults.height;
        }
        this.settings.position.y          = validateXYperc(this.settings.position.y, this.settings.width);
        this.settings.position.x          = validateXYperc(this.settings.position.x, this.settings.height);
        this.settings.zoom                = (this.settings.zoom < 0) ? 0 : this.settings.zoom;
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

            function killOri($ori){
                /* START :: remove attached custom events from original image */
                $window.unbind(onDemandScrollEventStr);
                $ori.unbind(onDemandClickEventName);
                $ori.parent().unbind(onDemandClickEventName);
                $ori.unbind(onDemandMouseEnterEventName);
                $ori.parent().unbind(onDemandMouseEnterEventName);
                /* END :: remove attached custom events from original image */

                $ori.removeAttr('style'); // first, remove all the styles first
                if(!$ori.data(oriStyleDataName)){
                    $ori.attr('style', $ori.data(oriStyleDataName)); // then re-store the original styles
                    $ori.removeData(oriStyleDataName); // remove data that stores the original stylings before the image being rendered
                }

                if($ori.data(pluginName)){
                    $ori.removeData(pluginName); // remove data that stored during plugin initialization
                }

                if($ori.data(dtOption)){
                    $ori.removeData(dtOption); // remove data that stored during plugin initialization
                }

                if($ori.data(onScrDataName)){
                    $ori.removeData(onScrDataName); // remove data that stored during plugin initialization
                }

                if($ori.data(renderPosDataName)){
                    $ori.removeData(renderPosDataName); // remove data that stored during plugin initialization
                }
            }

            if($this.data(pluginName)){
                var tempArr = [],
                    $thumb  = (function(){
                                    if($this.data(renderPosDataName) === 'after'){
                                        return $this.next();
                                    }
                                    return $this.prev();
                                })();

                if($thumb && $thumb.data(pluginName) !== pluginName){
                    if($this.data(dtOption).onDemand === false){ // kill only generated thumbnails
                        log('error', 'Could not find the element. It is probably due to one or more element has been added right before the image element after the plugin initialization or it was removed.');
                        return false;
                    }else{ // onDemand thumbnails are not generated yet, so customize the kill
                        killOri($this);
                    }
                }

                /* START :: remove output elements */
                tempArr = [];
                $.each(grandGlobal.outputElems, function(index, obj){
                    if($(obj)[0] != $thumb[0]){
                        tempArr.push(grandGlobal.outputElems[index]);
                    }
                });
                grandGlobal.outputElems = tempArr;
                /* END :: remove output elements */

                /* START :: remove input elements */
                tempArr = [];
                $.each(grandGlobal.inputElems, function(index, obj){
                    if($(obj)[0] != $this[0]){
                        tempArr.push(grandGlobal.inputElems[index]);
                    }
                });
                grandGlobal.inputElems = tempArr;
                /* END :: remove input elements */

                /* START :: remove attached custom event */
                if($thumb.data(resizeDataName)){
                    $window.unbind(onDemandScrollEventObj.resize);
                    $thumb.removeData(resizeDataName);
                }
                /* END :: remove attached custom event */

                $thumb.remove();

                killOri($this);
            }
        },

        native: function(_this, options){

            options.before.apply(_this, [_this]);

            function loadImg($this, imgUrl, cb){
                var img = new Image();
                img.onload = function(){
                    var jsTempImg = this;
                    if($.trim(options.width.toString().toLowerCase()) === 'auto'){
                        options.width = jsTempImg.width.toString();
                    }
                    if($.trim(options.height.toString().toLowerCase()) === 'auto'){
                        options.height = jsTempImg.height.toString();
                    }
                    var newImg        = {
                                            obj: jsTempImg,
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
                            'width'    : strToNum(options.width) + (getMeasurement(options.width) ? getMeasurement(options.width) : 'px'),
                            'height'   : strToNum(options.height) + (getMeasurement(options.height) ? getMeasurement(options.height) : 'px')
                        })
                        .data(pluginName, pluginName); // it would be easy to kill later

                    calculateReso();

                    if(!isNaN(optResp) && optResp > 0){
                        $imgContainer.data(resizeDataName, resizeThumb); // keep function into data for killing purpose later
                        $window.bind(onDemandScrollEventObj.resize, $imgContainer.data(resizeDataName));
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
                };
                img.src = imgUrl;
            }

            var that   = this,
                $this  = $(_this),
                imgUrl = $this.attr(options.source);

            $this.data(oriStyleDataName, $this.attr('style')); // keep original styles into data
            $this.data(renderPosDataName, options.renderPosition); // store render position (before/after) for killing purpose

            $this.hide();

            if(options.onDemand === true){
                if(options.onDemandEvent === 'scroll'){

                    $this.wrap('<div />'); // add temporary tag to get its offset().top

                    $this
                        .parent()
                            .css({ // set temporarily height
                                'width' : ((options.width) ? strToNum(options.width) + getMeasurement(options.width) : $this.width() + 'px'),
                                'height' : ((options.height) ? strToNum(options.height) + getMeasurement(options.height) : $this.height() + 'px')
                            });

                    $window
                        .bind(onDemandScrollEventStr, function(){ // check scroll position
                            var readyToLoad = checkPositionReach($this.parent(), options.onDemandScrollCheck);
                            if(readyToLoad && !$this.data(onScrDataName)){
                                $this
                                    .data(onScrDataName, true)
                                    .unwrap(); // remove temporary tag
                                loadImg($this, imgUrl, function($imgContainer){
                                    options.after.apply(_this, [$imgContainer]);
                                    that.updateGlobal(_this, $imgContainer, options);
                                });
                            }
                        })
                        .triggerHandler(onDemandScrollEventObj.scroll);

                }else if(options.onDemandEvent === 'click'){

                    $this.parent().bind(onDemandClickEventName, function(){
                        if(!$this.data(onScrDataName)){
                            loadImg($this, imgUrl, function($imgContainer){
                                options.after.apply(_this, [$imgContainer]);
                                that.updateGlobal(_this, $imgContainer, options);
                            }, true);
                            $this.data(onScrDataName, true);
                        }
                    });

                }else if(options.onDemandEvent === 'mouseenter'){

                            $this.parent().bind(onDemandMouseEnterEventName, function(){
                        if(!$this.data(onScrDataName)){
                            loadImg($this, imgUrl, function($imgContainer){
                                options.after.apply(_this, [$imgContainer]);
                                that.updateGlobal(_this, $imgContainer, options);
                            }, true);
                            $this.data(onScrDataName, true);
                        }
                    });

                }
            }else{
                loadImg($this, imgUrl, function($imgContainer){
                    options.after.apply(_this, [$imgContainer]);
                    that.updateGlobal(_this, $imgContainer, options);
                });
            }
        },

        modern: function (_this, options) {

            function loadImg($oriImage, imgUrl, cb){
                var img = new Image();
                img.onload = function(){
                    var jsTempImg = this;
                    if($.trim(options.width.toString().toLowerCase()) === 'auto'){
                        options.width = jsTempImg.width.toString();
                    }
                    if($.trim(options.height.toString().toLowerCase()) === 'auto'){
                        options.height = jsTempImg.height.toString();
                    }

                    var optW                    = (options.width) ? options.width : $oriImage.width().toString(),
                        optH                    = (options.height) ? options.height : $oriImage.height().toString(),
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
                };
                img.src = imgUrl;
            }

            options.before.apply(_this, [_this]);

            var that      = this,
                $oriImage = $(_this),
                imgUrl    = $oriImage.attr(options.source);

            $oriImage.data(oriStyleDataName, $oriImage.attr('style')); // keep original styles into data
            $oriImage.data(renderPosDataName, options.renderPosition); // store render position (before/after) for killing purpose

            $oriImage.hide();

            if(options.onDemand === true){
                if(options.onDemandEvent === 'scroll'){
                    $oriImage.wrap('<div />'); // add temporary tag to get its offset().top
                    $oriImage
                        .parent()
                            .css({ // set temporarily height
                                'width' : ((options.width) ? strToNum(options.width) + getMeasurement(options.width) : $oriImage.width() + 'px'),
                                'height' : ((options.height) ? strToNum(options.height) + getMeasurement(options.height) : $oriImage.height() + 'px')
                            });

                    $window
                        .bind(onDemandScrollEventStr, function(){ // check scroll position
                            var readyToLoad = checkPositionReach($oriImage.parent(), options.onDemandScrollCheck);
                            if(readyToLoad && !$oriImage.data(onScrDataName)){
                                $oriImage
                                    .data(onScrDataName, true)
                                    .unwrap(); // remove temporary tag
                                loadImg($oriImage, imgUrl, function($featuredBgImgContainer){
                                    options.after.apply(_this, [$featuredBgImgContainer]);
                                    that.updateGlobal(_this, $featuredBgImgContainer, options);
                                }, true);
                            }
                        })
                        .triggerHandler(onDemandScrollEventObj.scroll);

                }else if(options.onDemandEvent === 'click'){

                    $oriImage.parent().bind(onDemandClickEventName, function(){
                        if(!$oriImage.data(onScrDataName)){
                            loadImg($oriImage, imgUrl, function($featuredBgImgContainer){
                                options.after.apply(_this, [$featuredBgImgContainer]);
                                that.updateGlobal(_this, $featuredBgImgContainer, options);
                            }, true);
                            $oriImage.data(onScrDataName, true);
                        }
                    });

                }else if(options.onDemandEvent === 'mouseenter'){

                    $oriImage.parent().bind(onDemandMouseEnterEventName, function(){
                        if(!$oriImage.data(onScrDataName)){
                            loadImg($oriImage, imgUrl, function($featuredBgImgContainer){
                                options.after.apply(_this, [$featuredBgImgContainer]);
                                that.updateGlobal(_this, $featuredBgImgContainer, options);
                            }, true);
                            $oriImage.data(onScrDataName, true);
                        }
                    });

                }
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