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

    var pluginName  = "jqthumb",
        grandGlobal = { outputElems: [], inputElems: [] },
        defaults    = {
            classname      : 'jqthumb',
            width          : 100,
            height         : 100,
            position       : { x: '50%', y: '50%' },
            source         : 'src',
            responsive     : 20,
            zoom           : 1,
            showoncomplete : true,
            method         : 'auto', // auto, css3, native
            before         : function(){},
            after          : function(){},
            done           : function(){}
        };

    function Plugin ( element, options ) {// The actual plugin constructor
        this.element                = element;
        this.settings               = $.extend( {}, defaults, options );
        this.settings.width         = this.settings.width.toString().replace(/px/g, '');
        this.settings.height        = this.settings.height.toString().replace(/px/g, '');
        this.settings.position.y    = this.settings.position.y.toString().replace(/px/g, '');
        this.settings.position.x    = this.settings.position.x.toString().replace(/px/g, '');
        this._defaults              = defaults;
        this._name                  = pluginName;
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
            if(this.settings.method.toLowerCase() == 'auto'){
                if(this.support_css3_attr('backgroundSize') === false){ // old browsers need to do calculation to perform same output like "background-size: cover"
                    this.nonCss3Supported_method(this.element, this.settings);
                }else{ // modern browsers that support CSS3 would be easier
                    this.css3Supported_method(this.element, this.settings);
                }
            }else if(this.settings.method.toLowerCase() == 'css3'){
                this.css3Supported_method(this.element, this.settings);
            }else if(this.settings.method.toLowerCase() == 'native'){
                this.nonCss3Supported_method(this.element, this.settings);
            }else{
                log('error', 'Wrong method defined. Only "auto", "css3" and "native" are allowed.');
            }
        },

        kill: function(_this){
            var $this = $(_this);

            if( $this.data(pluginName)){

                if($this.prev().data(pluginName) !== pluginName){
                    log('error', 'We could not find the element created by jqthumb. It is probably due to one or more element has been added right before the image element after the plugin initialization, or it was removed.');
                    return false;
                }

                /* START: remove output elements */
                var tempArr = [];
                $.each(grandGlobal.outputElems, function(index, obj){
                    if($(obj)[0] == $this.prev()[0]){
                    }else{
                        tempArr.push(grandGlobal.outputElems[index]);
                    }
                });
                grandGlobal.outputElems = tempArr;
                /* END: remove output elements */

                /* START: remove input elements */
                tempArr = [];
                $.each(grandGlobal.inputElems, function(index, obj){
                    if($(obj)[0] == $this[0]){
                    }else{
                        tempArr.push(grandGlobal.inputElems[index]);
                    }
                });
                grandGlobal.inputElems = tempArr;
                /* END: remove input elements */

                /* START: remove attached custom event */
                if($this.prev().data(pluginName + 'resize')){
                    $(window).unbind('resize', $this.prev().data(pluginName + 'resize'));
                    $this.prev().removeData(pluginName + 'resize');
                }
                /* END: remove attached custom event */

                $this.prev().remove();

                $this.removeAttr('style'); // first, remove all the styles first
                if(typeof $this.data(pluginName + '-original-styles') !== 'undefined'){
                    $this.attr('style', $this.data(pluginName + '-original-styles')); // then re-store the original styles
                }

                if(typeof $this.data(pluginName + '-original-styles') !== 'undefined'){
                    $this.removeData(pluginName + '-original-styles'); // remove data that stores the original stylings before the image being rendered
                }

                if(typeof $this.data(pluginName) !== 'undefined'){
                    $this.removeData(pluginName); // remove data that stored during plugin initialization
                }
            }
        },

        nonCss3Supported_method: function(_this, options){

            options.before.call(_this, _this);

            var that = this,
                $this = $(_this);

            $this.data(pluginName + '-original-styles', $this.attr('style')); // keep original styles into data

            $this.hide();

            var $tempImg = $("<img/>");

            $tempImg.bind('load', function(){
                var newImg = {
                        obj: $tempImg,
                        size: {
                            width: this.width,
                            height: this.height
                        }
                    },
                    pw = that.percentOrPixel(options.width),
                    ph = that.percentOrPixel(options.height),
                    $imgContainer = $('<div />'),
                    ratio = 0,
                    resizeThumb = function(){
                        setTimeout(function(){
                            calculateReso();
                        }, options.responsive);
                    },
                    calculateReso = function(){
                        if(newImg.size.width > newImg.size.height){ // horizontal

                            $(newImg.obj).css({
                                'width'      : 'auto',
                                'max-height' : 99999999,
                                'min-height' : 0,
                                'max-width'  : 99999999,
                                'min-width'  : 0,
                                'height'     : $(newImg.obj).parent().height() + 'px'
                            });

                            ratio = $(newImg.obj).height() / $(newImg.obj).width(); // get ratio

                            if( $(newImg.obj).width() < $(newImg.obj).parent().width() ){
                                $(newImg.obj).css({
                                    'width': $(newImg.obj).parent().width() * options.zoom,
                                    'height': parseFloat($(newImg.obj).parent().width() * ratio) * options.zoom
                                });
                            }else{
                                $(newImg.obj).css({
                                    'width': $(newImg.obj).width() * options.zoom,
                                    'height': parseFloat($(newImg.obj).width() * ratio) * options.zoom
                                });
                            }

                        }else{ // vertical

                            $(newImg.obj).css({
                                'width'      : $(newImg.obj).parent().width() + 'px',
                                'max-height' : 99999999,
                                'min-height' : 0,
                                'max-width'  : 99999999,
                                'min-width'  : 0,
                                'height'     : 'auto'
                            });

                            ratio = $(newImg.obj).width() / $(newImg.obj).height(); // get ratio

                            if( $(newImg.obj).height() < $(newImg.obj).parent().height() ){
                                $(newImg.obj).css({
                                    'width': parseFloat($(newImg.obj).parent().height() * ratio) * options.zoom,
                                    'height': $(newImg.obj).parent().height() * options.zoom
                                });
                            }
                        }

                        posTop = (that.percentOrPixel(options.position.y) == '%') ? options.position.y : options.position.y + 'px';
                        posLeft = (that.percentOrPixel(options.position.x) == '%') ? options.position.x : options.position.x + 'px';

                        $(newImg.obj).css({
                            'position'    : 'absolute',
                            'top'         : (function(){
                                if(that.percentOrPixel(options.position.y) == '%'){
                                    return '-' + parseFloat(($(newImg.obj).height() - $imgContainer.height()) / 100 * options.position.y.replace('%', '')) + 'px';
                                }else if(that.percentOrPixel(options.position.y) == 'px' || isNaN(options.position.y) === false){
                                    return options.position.y.replace('px', '') + 'px';
                                }
                            })(),
                            'left'        : (function(){
                                if(that.percentOrPixel(options.position.x) == '%'){
                                    return '-' + parseFloat(($(newImg.obj).width() - $imgContainer.width()) / 100 * options.position.x.replace('%', '')) + 'px';
                                }else if(that.percentOrPixel(options.position.x) == 'px' || isNaN(options.position.x) === false){
                                    return options.position.x.replace('px', '') + 'px';
                                }
                            })()
                        });
                    };

                $imgContainer
                    .insertBefore($this)
                    .append($(newImg.obj))
                    .css({
                        'position' : 'relative',
                        'overflow' : 'hidden',
                        'width'    : (pw == '%') ? options.width : options.width + 'px',
                        'height'   : (ph == '%') ? options.height : options.height + 'px'
                    })
                    .data(pluginName, pluginName); // it would be easy to kill later

                calculateReso();

                if(options.responsive > 0){
                    $imgContainer.data(pluginName + 'resize', resizeThumb); // keep function into data for killing purpose later
                    $(window).bind('resize', $imgContainer.data(pluginName + 'resize'));
                }

                $imgContainer
                    .hide()
                    .addClass(options.classname);

                if(options.showoncomplete === true){
                    $imgContainer.show();
                }
                options.after.call(_this, $imgContainer);

                that.updateGlobal(_this, $imgContainer, options);

            }).attr("src", $this.attr(options.source)); // for older browsers, must bind events first then set attr later (IE7, IE8)
        },

        css3Supported_method: function (_this, options) {
            options.before.call(_this, _this);

            var that = this,
                $oriImage = $(_this),
                $tempImg = $('<img />').attr('src', $oriImage.attr(options.source));

            $oriImage.data(pluginName + '-original-styles', $oriImage.attr('style')); // keep original styles into data

            $oriImage.hide();

            $.each($tempImg, function(index, obj){
                var $tempImg = $(obj);

                $tempImg.one('load', function() {
                    var pw = that.percentOrPixel(options.width),
                        ph = that.percentOrPixel(options.height),
                        $featuredBgImgContainer = null,
                        $featuredBgImg = null;

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

                    $featuredBgImg = $('<div/>').css({
                        'width'              : '100%',
                        'height'             : '100%',
                        'background-image'   : 'url("' + $oriImage.attr(options.source) + '")',
                        // '-ms-filter'         : '"progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + $oriImage.attr(options.source) + '",sizingMethod="scale")', // this does not work in Zepto
                        'background-repeat'  : 'no-repeat',
                        'background-position': (function(){
                            var posTop = (that.percentOrPixel(options.position.y) == '%') ? options.position.y : options.position.y + 'px',
                                posLeft = (that.percentOrPixel(options.position.x) == '%') ? options.position.x : options.position.x + 'px';
                            return posLeft + ' ' + posTop;
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
                            .css({
                                'top'      : (function(){
                                    // (cH - pH) / pH * 100 / percentage
                                    var cH = $featuredBgImgContainer.height(),
                                        pH = $featuredBgImg.height();
                                    if(that.percentOrPixel(options.position.y) == '%'){
                                        return '-' + parseFloat((pH - cH) / cH * 100 / (100 / options.position.y.replace('%', '')) ) + '%';
                                    }
                                })(),
                                'left'     : (function(){
                                    // (cW - pW) / pH * 100 / percentage
                                    var cW = $featuredBgImgContainer.width(),
                                        pW = $featuredBgImg.width();
                                    if(that.percentOrPixel(options.position.x) == '%'){
                                        return '-' + parseFloat((pW - cW) / cW * 100 / (100 / options.position.x.replace('%', '')) ) + '%';
                                    }
                                })()
                            });
                        $featuredBgImgContainer.hide();
                    }

                    if(options.showoncomplete === true){
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

        var global = {
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
        obj = {};

        obj[pluginName] = function(action){
            if(typeof action == 'undefined'){
                log('error', 'Please specify an action like $.jqthumb("killall")');
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