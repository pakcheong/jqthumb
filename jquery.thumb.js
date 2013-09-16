/*
	Copyright (c) 2013-2013 Tho Pak Cheong
	Version: 1.3.5 (16-SEP-2013)
	Dual licensed under the MIT and GPL licenses.
	Requires: jQuery v1.3 or later

	Change Log:
	V1.1
	=========================
	1. Uses jquery boilerplate written in https://github.com/jquery-boilerplate/jquery-boilerplate/blob/master/src/jquery.boilerplate.js as a plugin template
	2. Dimension now supports percentage instead of fixed value. But it only works in CSS3-supported browsers.
	3. Fixed bugs that occur when there are two plugin initializations and options in the 2nd one would replace the options in the first one. But I have no idea how I fixed it though, it just worked out of sudden after many hours of debugging.

	V1.2
	=========================
	1. "complete" callback is now called "eachcomplete".
	2. Added "allcomplete" callback to do only one single callback when everything is done.
	3. Added global variables to store things to be used in every methods globally.
	4. Added updateGlobal() method to update global variables and also keep all input and output elements.
	5. Fixed bug - methods.getActualSize() has changed to this.getActualSize().
	
	V1.2.1
	=========================
	1. Bug occurs when you have more than one initialzations and global.counter keep adding up from the previous initialzation. Bug fixed.
	
	v1.2.2
	=========================
	1. Bug occurs when you have more than one initialzations and global.outputElems keep stacking up objects from the previous initialzation. Bug fixed.
	2. Bug occurs in older browsers which causes images not showing up when "allcomplete" callback is used.
	3. Removed unwanted parameter from contrustor.
	4. Change of variable names.

	v1.3.0
	=========================
	1. Added "img_src" attribute for specifying the image source. Because some people might want to do lazy-loading to optimize the performance of the site.
	
	v1.3.1
	=========================
	1. Fixed browser-hang issue in IE8,7,6.
	2. Added real demo image file instead of using a 64-bit image.
	
	v1.3.2
	=========================
	1. Permanently fixed browser-hang issue in IE8,7,6.
	
	v1.3.3
	=========================
	1. Width and height in percentage is now supported.
	2. Split makethumbnail method into two different methods for better maintenance.
	3. Added a local jQuery core file.
	
	v1.3.4
	=========================
	1. This plugin now supports from jQuery v1.3 and above. Previously was v1.8 and above.
	
	v1.3.5
	=========================
	1. Changed attribute name from "img_src" to "source".
*/

;(function ( $, window, document, undefined ) {
	
	var pluginName = "jqthumb",
		defaults = {
			classname: 'jqthumb',
			width: 100,
			height: 100,
			source: 'src',
			showoncomplete: true,
			eachcomplete: function(){},
			allcomplete: function(){}
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
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			if(this.support_css3_attr('backgroundSize') == false){ // old browsers need to do calculation to perform same output like "background-size: cover"
				this.nonCss3Supported_method(this.element, this.settings);
			}else{ // modern browsers that support CSS3 would be easier
				this.css3Supported_method(this.element, this.settings);
			}
		},

		nonCss3Supported_method: function(_this, options){
			var that = this;

			$(_this).hide();

			$(_this).one('load',function() {
				that.checkSrcAttrName(_this, options);
				
				var tempImg = $("<img/>").attr("src", $(_this).attr("src"));
				$(tempImg).load(function(){

					var oriImg = {
							obj: $(_this),
							size: {
								width: this.width,
								height: this.height
							}
						},
						pw = that.percentOrPixel(options.width),
						ph = that.percentOrPixel(options.height);
				
					$(_this).parent().css({
						'position': 'relative',
						'overflow': 'hidden',
						'width': (pw == '%') ? options.width : options.width + 'px',
						'height': (ph == '%') ? options.height : options.height + 'px'
					});
					
					if(oriImg.size.width > oriImg.size.height){ // horizontal
						$(oriImg.obj).css({
							'width' : 'auto',
							'max-height' : 99999999,
							'min-height' : 0,
							'max-width' : 99999999,
							'min-width' : 0,
							'height' : $(oriImg.obj).parent().height() + 'px'
						});
						
						var ratio = $(oriImg.obj).height() / $(oriImg.obj).width(); // get ratio
						
						if( $(oriImg.obj).width() < $(oriImg.obj).parent().width() ){
							$(oriImg.obj).css({
								'width': $(oriImg.obj).parent().width(),
								'height': parseInt($(oriImg.obj).parent().width() * ratio)
							});
						}
					}else{ // vertical
						
						$(oriImg.obj).css({
							'width' : $(oriImg.obj).parent().width() + 'px',
							'max-height' : 99999999,
							'min-height' : 0,
							'max-width' : 99999999,
							'min-width' : 0,
							'height' : 'auto'
						});
						
						var ratio = $(oriImg.obj).width() / $(oriImg.obj).height(); // get ratio
						
						if( $(oriImg.obj).height() < $(oriImg.obj).parent().height() ){
							$(oriImg.obj).css({
								'width': parseInt($(oriImg.obj).parent().height() * ratio),
								'height': $(oriImg.obj).parent().height()
							});
						}
					}

					if($(oriImg.obj).width() > $(oriImg.obj).parent().width()){
						$(oriImg.obj).css({
							'position': 'absolute',
							'top': 0,
							'left': parseInt(($(oriImg.obj).parent().width() - $(oriImg.obj).width()) / 2) + 'px'
						});
					}
					
					if($(oriImg.obj).height() > $(oriImg.obj).parent().height()){
						$(oriImg.obj).css({
							'position': 'absolute',
							'top': parseInt(($(oriImg.obj).parent().height() - $(oriImg.obj).height()) / 2) + 'px',
							'left': 0
						});
					}
					
					$(oriImg.obj).addClass(options.classname);
					if(options.showoncomplete == true){
						$(oriImg.obj).show();
					}
					options.eachcomplete.call(_this, $(oriImg.obj));

					that.updateGlobal(_this, $(oriImg.obj), options);
			
				}).each(function(){

					$(tempImg).load();

				});
			}).each(function(){

				$(_this).load();

			});
		},

		css3Supported_method: function (_this, options) {
			var that = this;
			$(_this).hide();

			$(_this).one('load',function() {
				var pw = that.percentOrPixel(options.width),
					ph = that.percentOrPixel(options.height),
					featuredBgImg;

				$(_this).parent().css({
					'width': (pw == '%') ? options.width : options.width + 'px',
					'height': (ph == '%') ? options.height : options.height + 'px'
				});
				featuredBgImg = $('<div/>').css({
					'width': '100%',
					'height': '100%',
					'background-image': 'url("' + $(_this).attr(options.source) + '")',
					'-ms-filter': '"progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+$(_this).attr(options.source)+'",sizingMethod="scale")',
					'background-repeat': 'no-repeat',
					'background-position': 'center center',
					'background-size': 'cover',
					'display': 'none'
				})
				.addClass(options.classname)
				.insertBefore($(_this));

				if(options.showoncomplete == true){
					$(featuredBgImg).show();
				}

				that.checkSrcAttrName(_this, options);

				options.eachcomplete.call(_this, $(featuredBgImg));

				that.updateGlobal(_this, $(featuredBgImg), options);

			}).each(function(){

				$(_this).load();

			});
		},

		updateGlobal: function(_this, obj, options){
			global.outputElems.push($(obj));
			global.elemCounter = global.elemCounter + 1;
			if(global.elemCounter == global.totalElems){
				options.allcomplete.call(_this, global.outputElems);
			}
		},
		
		checkSrcAttrName: function(_this, options){
			if(
				options.source != 'src' && 
				(
					typeof $(_this).attr('src') == 'undefined' || 
					$(_this).attr('src') == ''
				)
			)
			{
				$(_this).attr('src', $(_this).attr(options.source));
			}
		},

		percentOrPixel: function(str){
			var str = str.toString();
			var lastChar = str.charAt(str.length - 1);
			var str = str.substr(0, str.length - 1);
			if(!isNaN( parseFloat(str) ) && isFinite(str)){ // equivalent to $.isNumeric in jQuery
				if(lastChar == '%'){
					return '%';
				}
				if(str.charAt(str.length - 2, str.length).toLowerCase() == 'px'){
					return 'px';
				}
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
	
		if($.isFunction($.fn.addBack) == false){ // we need to use addBack functions which only exists from jQuery v1.3 and above. 
			$.fn.extend({
				addBack: function( selector ) {
					return this.add( selector == null ?
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
			
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );