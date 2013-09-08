/*
	Copyright (c) 2013-2013 Tho Pak Cheong
	Version: 1.3.0 (8-SEP-2013)
	Dual licensed under the MIT and GPL licenses.
	Requires: jQuery v1.8.0 or later

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
	1. Added "img_src" attribute for specifying the image source. Because some people might want to do lazy-loading to optimize the performance of the site.
*/

;(function ( $, window, document, undefined ) {
	
	var pluginName = "jqthumb",
		defaults = {
			classname: 'jqthumb',
			width: 100,
			height: 100,
			img_src: 'src',
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
		console.log(this.settings);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			this.makethumbnail(this.element, this.settings);
		},

		makethumbnail: function (_this, options) {
			var that = this;
			$(_this).hide();

			$(_this).one('load',function() {
				if(that.support_css3_attr('backgroundSize') == false){ // old browsers need to do calculation to perform same output like "background-size: cover"
					$(_this).parent().css({
						'position': 'relative',
						'overflow': 'hidden',
						'width': options.width + 'px',
						'height': options.height + 'px'
					});
					
					var oriImg = {
						obj: $(_this),
						size: that.getActualSize( $(_this) )// get actual size
					}
					
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
				}else{
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
						'background-image': 'url("' + $(_this).attr(options.img_src) + '")',
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

					if(options.img_src != 'src' && $(_this).attr('src') == ''){
						$(_this).attr('src', $(_this).attr(options.img_src));
					}

					options.eachcomplete.call(_this, $(featuredBgImg));

					that.updateGlobal(_this, $(featuredBgImg), options);
				}
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

		percentOrPixel: function(str){
			var str = str.toString();
			var lastChar = str.charAt(str.length - 1);
			var str = str.substr(0, str.length - 1);
			if($.isNumeric(str)){
				if(lastChar == '%'){
					return '%';
				}
				if(str.charAt(str.length - 2, str.length).toLowerCase() == 'px'){
					return 'px';
				}
			}
		},

		getActualSize: function(imgObj){
			var tempImg = new Image();
			tempImg.src = imgObj.attr(options.img_src);
			imgObj = {
				width: tempImg.width,
				height: tempImg.height
			}
			return imgObj;
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

				while(len--) {
					if ( vendors[len] + prop in div.style ) {
						// browser supports box-shadow. Do what you need.
						// Or use a bang (!) to test if the browser doesn't.
						return true;
					} 
				}
				return false;
			};
		})()
	};

	$.fn[ pluginName ] = function ( options ) {

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