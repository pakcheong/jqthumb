/*!
    jQThumb v2.3.6
    Copyright (c) 2013-2016
    Released under the MIT license.

    Author       : Pak Cheong
    Version      : 2.3.6
    Repo         : git@github.com:pakcheong/jqthumb.git
    Demo         : http://pakcheong.github.io/jqthumb/
    Last Updated : Sunday, April 10th, 2016, 2:42:38 PM
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
            } else if (typeof Zepto !== 'undefined') {
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
        return parseFloat(str);
        // return Number(str.replace(/[^\d.-]/g, ''));
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

    /* Fallback for older versions of jQuery */
    if(!$.fn.unwrap){
        $.fn.unwrap = function(){
            this.parent().each(function() {
                if ( !$.nodeName( this, 'body' ) ) {
                    $( this ).replaceWith( this.childNodes );
                }
            }).end();
        };
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

    var pluginName                  = 'jqthumb',
        $window                     = $(window),
        onDemandScrollEventObj      = (function(){
                                            var tmp = ['scroll', 'resize', 'scrolltop'];
                                            var obj = {};
                                            for(var i=0; i<tmp.length; i++){
                                                obj[tmp[i]] = tmp[i] + '.' + pluginName;
                                            }
                                            return obj;
                                        })(),
        onDemandScrollEventStr      = (function(){
                                            var tmp = [];
                                            $.each(onDemandScrollEventObj, function(key, val){
                                                tmp.push(val);
                                            });
                                            return tmp.join(' ');
                                        })(),
        onDemandClickEventName      = 'click.' + pluginName,
        onDemandMouseEnterEventName = 'mouseenter.' + pluginName,
        renderPosDataName           = pluginName + '-render-position',
        oriStyleDataName            = pluginName + '-original-styles',
        inViewPortDataName          = pluginName + '-inviewport',
        dtOption                    = pluginName + '-options',
        dtStatus                    = pluginName + '-status',
        dtEvtFnOneTime              = pluginName + '-onetime-event',
        dtEvtFnOngoing              = pluginName + '-ongoing-event',
        dtEvtFnResponsive           = pluginName + '-responsive',
        dtTmpImg                    = pluginName + 'tmp-img',
        grandGlobal                 = { outputElems: [], inputElems: [] },
        defaults                    = {
                                            classname      : pluginName,
                                            width          : 100,
                                            height         : 100,
                                            position       : { x: '50%', y: '50%' },
                                            source         : 'src',
                                            responsive     : 20,
                                            zoom           : 1,
                                            show           : true,
                                            renderPosition : 'before', // before, after
                                            onDemand       : false,
                                            onDemandEvent  : 'scroll',
                                            threshold      : 0,
                                            method         : 'auto', // auto, modern, native
                                            reinit         : true, // true, false
                                            error          : function(){},
                                            before         : function(){},
                                            after          : function(){},
                                            done           : function(){}
                                        };

    function Plugin ( element, options ) {// The actual plugin constructor
        $.fn[pluginName].defaults   = $.extend( {}, defaults, $.fn[pluginName].defaults );
        this.element                = element;
        this.settings               = $.extend( {}, $.fn[pluginName].defaults, options );
        this.settings.onDemandEvent = this.settings.onDemandEvent.toLowerCase();
        this.settings.threshold     = this.settings.threshold.toString().replace(/px/gi, '');
        this.settings.width         = this.settings.width.toString().replace(/px/gi, '');
        this.settings.height        = this.settings.height.toString().replace(/px/gi, '');
        if(!this.settings.width){
            options.width = defaults.width;
            this.settings.width = defaults.width;
        }
        if(!this.settings.height){
            options.height = defaults.height;
            this.settings.height = defaults.height;
        }
        this.settings.position.y    = validateXYperc(this.settings.position.y, this.settings.width);
        this.settings.position.x    = validateXYperc(this.settings.position.x, this.settings.height);
        this.settings.zoom          = (this.settings.zoom < 0) ? 0 : this.settings.zoom;
        if(typeof options == 'string'){
            if(options.toLowerCase() == 'kill'){
                this.kill(this.element);
            }
        }else{
            $(this.element).data(dtOption, this.settings);
            this.init(this.element, this.settings);
        }
    }

    Plugin.prototype = {

        kill: function(self){
            var $oriImage = $(self);

            function killOri($ori){
                /* START :: remove attached custom events from original image */
                $window.unbind(onDemandScrollEventStr, $ori.data(dtEvtFnOngoing));
                $window.unbind(onDemandScrollEventObj.resize, $ori.data(dtEvtFnResponsive));
                $ori.parent().unbind(onDemandClickEventName, $ori.data(dtEvtFnOneTime));
                $ori.parent().unbind(onDemandMouseEnterEventName, $ori.data(dtEvtFnOneTime));
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

                if($ori.data(inViewPortDataName)){
                    $ori.removeData(inViewPortDataName); // remove data that stored during plugin initialization
                }

                if($ori.data(renderPosDataName)){
                    $ori.removeData(renderPosDataName); // remove data that stored during plugin initialization
                }

                if($ori.data(dtStatus)){
                    $ori.removeData(dtStatus); // remove data that stored during plugin initialization
                }

                if($ori.data(dtEvtFnOneTime)){
                    $ori.removeData(dtEvtFnOneTime); // remove data that stored during plugin initialization
                }

                if($ori.data(dtEvtFnOngoing)){
                    $ori.removeData(dtEvtFnOngoing); // remove data that stored during plugin initialization
                }

                if($ori.data(dtTmpImg)){
                    $ori.removeData(dtTmpImg); // remove data that stored during plugin initialization
                }
            }

            if($oriImage.data(pluginName)){
                var tempArr = [],
                    $thumb  = (function(){
                                    if($oriImage.data(renderPosDataName) === 'after'){
                                        return $oriImage.next();
                                    }
                                    return $oriImage.prev();
                                })();

                if($thumb && $thumb.data(pluginName) !== pluginName){
                    if($oriImage.data(dtStatus) === 'error'){
                        killOri($oriImage);
                        return false;
                    }else if($oriImage.data(dtOption).onDemand === false){ // kill only generated thumbnails
                        log('error', 'Could not find the generated element.');
                        return false;
                    }else{ // onDemand thumbnails are not generated yet, so customize the kill
                        killOri($oriImage);
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
                    if($(obj)[0] != $oriImage[0]){
                        tempArr.push(grandGlobal.inputElems[index]);
                    }
                });
                grandGlobal.inputElems = tempArr;
                /* END :: remove input elements */

                /* START :: remove attached custom event */
                $window.unbind(onDemandScrollEventObj.resize);
                /* END :: remove attached custom event */

                $thumb.remove();

                killOri($oriImage);
            }
        },

        lazyload: function(PluginClass, self, options, cb){
            var $oriImage = $(self),
                img       = $oriImage.data(dtTmpImg),
                imgUrl    = ($oriImage.attr(options.source)) ? $oriImage.attr(options.source) : ''; // prevent "undefined" error

            img.onload = function(){
                cb(img);
            };
            img.onerror = function(){
                options.error.apply(self, [self, (imgUrl) ? imgUrl : undefined]);
                $oriImage.data(dtStatus, 'error');
                PluginClass.kill($oriImage);
            };
            img.src = imgUrl;
        },

        processImg: function(self, options, img, fnDoMathOnSuccess){
            var PluginClass = this,
                $oriImage   = $(self),
                imgUrl      = $oriImage.attr(options.source);

            fnDoMathOnSuccess({
                tmpImgDom : img,
                oriImg    : $oriImage,
                width     : img.naturalWidth,
                height    : img.naturalHeight,
                done      : function($wrapper){
                    if(options.show === true){
                        $wrapper.show();
                    }
                    options.after.apply(self, [$wrapper]);
                    PluginClass.updateGlobal(self, $wrapper, options);
                }
            });
        },

        init: function (self, options) {
            function modernMath(obj){
                var optW    = ($.trim(options.width.toString().toLowerCase()) === 'auto') ? obj.tmpImgDom.width.toString() : options.width,
                    optH    = ($.trim(options.height.toString().toLowerCase()) === 'auto') ? obj.tmpImgDom.height.toString() : options.height,
                    optZ    = options.zoom,
                    optPosX = options.position.x,
                    optPosY = options.position.y,
                    $wrapper, $fakeImg;

                $wrapper = $('<div/>')
                            .css({
                                'width'    : strToNum(optW) + getMeasurement(optW),
                                'height'   : strToNum(optH) + getMeasurement(optH),
                                'display'  : 'none',
                                'position' : 'relative',
                                'overflow' : 'hidden'
                            })
                            .addClass(options.classname)
                            .data(pluginName, pluginName); // it would be easy to kill later

                $fakeImg = $('<div/>')
                            .css({
                                'width'              : '100%',
                                'height'             : '100%',
                                'background-image'   : 'url("' + imgUrl + '")',
                                // '-ms-filter'         : '"progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + $oriImage.attr(options.source) + '",sizingMethod="scale")', // this does not work in Zepto
                                'background-repeat'  : 'no-repeat',
                                'background-position': strToNum(optPosX) + getMeasurement(optPosX) + ' ' + strToNum(optPosY) + getMeasurement(optPosY),
                                'background-size'    : 'cover'
                            })
                            .appendTo($wrapper);

                if(options.renderPosition.toLowerCase() === 'after'){
                    $wrapper.insertAfter(obj.oriImg);
                }else{
                    $wrapper.insertBefore(obj.oriImg);
                }

                $wrapper.show(); // must show first to get resolution
                $fakeImg
                    .css({
                        'width'    : parseFloat(100 * optZ) + '%',
                        'height'   : parseFloat(100 * optZ) + '%',
                        'position' : 'absolute'
                    })
                    .css({ // cannot combine css() as width and height have to be defined before doing calculation
                        'top'      : (function(){
                            // (cH - pH) / pH * 100 / percentage
                            var cH = $wrapper.height(),
                                pH = $fakeImg.height();
                            if(getMeasurement(optPosY) == '%'){
                                return '-' + parseFloat((pH - cH) / cH * 100 / (100 / strToNum(optPosY) ) ) + '%';
                            }
                        })(),
                        'left'     : (function(){
                            // (cW - pW) / cW * 100 / percentage
                            var cW = $wrapper.width(),
                                pW = $fakeImg.width();
                            if(getMeasurement(optPosX) == '%'){
                                return '-' + parseFloat((pW - cW) / cW * 100 / (100 / strToNum(optPosX) ) ) + '%';
                            }
                        })()
                    });
                $wrapper.hide();

                if (typeof obj.done === 'function'){
                    obj.done($wrapper);
                }
            }

            function nativeMath(obj){
                var oriW         = obj.tmpImgDom.width,
                    oriH         = obj.tmpImgDom.height,
                    optW         = ($.trim(options.width.toString().toLowerCase()) === 'auto') ? oriW.toString() : options.width,
                    optH         = ($.trim(options.height.toString().toLowerCase()) === 'auto') ? oriH.toString() : options.height,
                    optZ         = options.zoom,
                    optPosX      = options.position.x,
                    optPosY      = options.position.y,
                    measure_optW = getMeasurement(optW),
                    measure_optH = getMeasurement(optH),
                    optResp      = options.responsive,
                    $wrapper, $fakeImg;

                $fakeImg      = $(obj.tmpImgDom);
                $wrapper      = $('<div />');

                function calculateReso(){
                    var ratio = 0;

                    if(oriW > oriH){ // horizontal

                        $fakeImg.css({
                            'width'      : 'auto',
                            'max-height' : 99999999,
                            'min-height' : 0,
                            'max-width'  : 99999999,
                            'min-width'  : 0,
                            'height'     : $wrapper.height() + 'px'
                        });

                        ratio = $fakeImg.height() / $fakeImg.width(); // get ratio

                        if($fakeImg.width() < $wrapper.width()){
                            $fakeImg.css({
                                'width' : $wrapper.width() * optZ,
                                'height': parseFloat($wrapper.width() * ratio) * optZ
                            });
                        }else{
                            $fakeImg.css({
                                'width' : $fakeImg.width() * optZ,
                                'height': parseFloat($fakeImg.width() * ratio) * optZ
                            });
                        }

                    }else{ // vertical

                        $fakeImg.css({
                            'width'      : $wrapper.width() + 'px',
                            'max-height' : 99999999,
                            'min-height' : 0,
                            'max-width'  : 99999999,
                            'min-width'  : 0,
                            'height'     : 'auto'
                        });

                        ratio = $fakeImg.width() / $fakeImg.height(); // get ratio

                        if($fakeImg.height() < $wrapper.height()){
                            $fakeImg.css({
                                'width' : parseFloat($wrapper.height() * ratio) * optZ,
                                'height': $wrapper.height() * optZ
                            });
                        }

                    }

                    if(optZ < 1){ // workaround for zoom level < 1
                        var $subContainer = $('<div />');

                        $subContainer
                            .css({
                                'width'    : parseFloat(strToNum(optW.toString()) * optZ) + getMeasurement(optW.toString()),
                                'height'   : parseFloat(strToNum(optH.toString()) * optZ) + getMeasurement(optH.toString()),
                                'position' : 'relative',
                                'overflow' : 'hidden'
                            })
                            .appendTo($fakeImg.parent());

                        $fakeImg.appendTo($subContainer); // move $fakeImg into $subContainer
                    }

                    $fakeImg.css({
                        'position'    : 'absolute',
                        'left'        : (function(){
                            var x = 0;
                            if(getMeasurement(optPosX) == '%'){
                                x = parseFloat(($fakeImg.width() - $fakeImg.parent().width()) / 100 * strToNum(optPosX));
                                return (x <= 0) ? x + 'px' : '-' + x + 'px';
                            }else if(getMeasurement(optPosX) == 'px' || isNaN(optPosX) === false){
                                return strToNum(optPosX) + 'px';
                            }
                        })(),
                        'top'         : (function(){
                            var y = 0;
                            if(getMeasurement(optPosY) == '%'){
                                y = parseFloat(($fakeImg.height() - $fakeImg.parent().height()) / 100 * strToNum(optPosY));
                                return (y <= 0) ? y + 'px' : '-' + y + 'px';
                            }else if(getMeasurement(optPosY) == 'px' || isNaN(optPosY) === false){
                                return strToNum(optPosY) + 'px';
                            }
                        })()
                    });
                }

                if(options.renderPosition.toLowerCase() === 'after'){
                    $wrapper.insertAfter(obj.oriImg);
                }else{
                    $wrapper.insertBefore(obj.oriImg);
                }

                $wrapper
                    .append($fakeImg)
                    .css({
                        'position' : 'relative',
                        'overflow' : 'hidden',
                        'width'    : strToNum(optW) + (measure_optW ? measure_optW : 'px'),
                        'height'   : strToNum(optH) + (measure_optH ? measure_optH : 'px')
                    })
                    .data(pluginName, pluginName); // it would be easy to kill later

                calculateReso();

                if(!isNaN(optResp) && optResp > 0){
                    $(obj.oriImage).data(dtEvtFnResponsive, function(){
                        setTimeout(function(){
                            calculateReso();
                        }, optResp);
                    });
                    $window.bind(onDemandScrollEventObj.resize, $(obj.oriImage).data(dtEvtFnResponsive));
                }

                $wrapper
                    .hide()
                    .addClass(options.classname);

                if (typeof obj.done === 'function'){
                    obj.done($wrapper);
                }
            }

            options.before.apply(self, [self]);

            var PluginClass = this,
                $oriImage   = $(self),
                imgUrl      = $oriImage.attr(options.source),
                doMath      = (function(method){
                                if(method == 'auto'){
                                    if(css3Supported('backgroundSize') === false){ // old browsers need to do calculation to perform same output like "background-size: cover"
                                        return nativeMath;
                                    }
                                    return modernMath; // modern browsers that support CSS3 would be easier
                                }else if(method == 'modern'){
                                    return modernMath;
                                }else if(method == 'native'){
                                    return nativeMath;
                                }else{
                                    log('error', 'Invalid method. Only "auto", "modern" and "native" are allowed.');
                                }
                            })(options.method.toString().toLowerCase());

            if(doMath){
                $oriImage.data(oriStyleDataName, $oriImage.attr('style')); // keep original styles into data
                $oriImage.data(renderPosDataName, options.renderPosition); // store render position (before/after) for killing purpose
                $oriImage.hide();
                if(options.onDemand === true){
                    PluginClass.demand(self, options, imgUrl, doMath);
                }else{
                    $oriImage.data(dtTmpImg, new Image());
                    PluginClass.lazyload(PluginClass, self, options, function(img){
                        PluginClass.processImg(self, options, img, doMath);
                        $oriImage.removeData(dtTmpImg);
                    });
                }
            }else{
                $oriImage.data(dtStatus, 'error');
                PluginClass.kill($oriImage);
            }
        },

        demand: function(self, options, imgUrl, fnDoMathOnSuccess){
            var PluginClass = this,
                $oriImage   = $(self);

            if(options.onDemandEvent === 'scroll'){
                $oriImage.wrap('<div />'); // add temporary tag to get its offset().top
                var $tmpWrapper = $oriImage.parent();
                $tmpWrapper.css({ // set temporarily height
                    'width' : ((options.width) ? strToNum(options.width) + getMeasurement(options.width) : $oriImage.width() + 'px'),
                    'height' : ((options.height) ? strToNum(options.height) + getMeasurement(options.height) : $oriImage.height() + 'px')
                });

                $oriImage.data(dtEvtFnOngoing, function(){ // store event fn into data for unbinding purpose
                    if( checkPositionReach($tmpWrapper, options.threshold) ){ // check scroll position
                        $window.unbind(onDemandScrollEventStr, $oriImage.data(dtEvtFnOngoing)); // unbind when it is done process to save CPU usage
                        $oriImage.removeData(dtEvtFnOngoing);
                        $oriImage.unwrap(); // remove temporary tag
                        $oriImage.data(dtTmpImg, new Image());
                        PluginClass.lazyload(PluginClass, self, options, function(img){
                            PluginClass.processImg(self, options, img, fnDoMathOnSuccess);
                            $oriImage.removeData(dtTmpImg);
                        });
                    }
                });

                $window
                    .bind(onDemandScrollEventStr, $oriImage.data(dtEvtFnOngoing))
                    .triggerHandler(onDemandScrollEventObj.scroll);
            }else if(
                options.onDemandEvent === 'click' || 
                options.onDemandEvent === 'mouseenter'
            ){
                var $bindTarget = $oriImage.parent(),
                    bindName    = ((options.onDemandEvent === 'click') ? onDemandClickEventName : onDemandMouseEnterEventName);

                $oriImage.data(dtEvtFnOneTime, function(){ // store event fn into data for unbinding purpose
                    $bindTarget.unbind(bindName, $oriImage.data(dtEvtFnOneTime)); // unbind when it is done process to save CPU usage
                    $oriImage.removeData(dtEvtFnOneTime);
                    $oriImage.data(dtTmpImg, new Image());
                    PluginClass.lazyload(PluginClass, self, options, function(img){
                        PluginClass.processImg(self, options, img, fnDoMathOnSuccess);
                        $oriImage.removeData(dtTmpImg);
                    });
                    $oriImage.data(inViewPortDataName, true);
                });
                $bindTarget.bind(bindName, $oriImage.data(dtEvtFnOneTime));
            }
        },

        updateGlobal: function(self, obj, options){
            self.global.outputElems.push( $(obj)[0] );
            self.global.elemCounter++;
            grandGlobal.outputElems.push( $(obj)[0] );
            if(self.global.elemCounter == self.global.inputElems.length){
                options.done.apply(self, [self.global.outputElems]);
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
                if($eachImg.data(dtTmpImg) && $eachImg.data(dtTmpImg).complete === false){ // catch re-initialization before image is loaded
                    $eachImg.data(dtTmpImg).src = ''; // abort loading image;
                    new Plugin(this, 'kill');
                }
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