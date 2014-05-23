/*
	Copyright (c) 2013-2014 Tho Pak Cheong
	Version: 1.6 (23-MAY-2014)
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
	
	v1.4
	=========================
	1. Added "position.top" and "position.left" attributes to allow users specify which portion of the photos to be shown.
	2. Added "before" callback.
	3. Renamed "eachcomplete" callback to "after".
	4. Renamed "allcomplete" callback to "complete".
	5. Simplified and fixed "percentOrPixel()" method.
	6. Changed all "parseInt()" to "parseFloat()" to get more accurate values.
	7. Replace 'px' from all atributes during plugin initialzation.

	v1.4.1
	=========================
	1. Change callback name from "complete" to "done" as the name "complete" is a reserved by jQuery.

	v1.5
	=========================
	1. Add <div/> image container wrap images, so the original element that wraps the image will not be modified in terms of styling.

	v1.6
	=========================
	1. Add "kill" method to undo everything of the element.
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
			this.settings.width			= this.settings.width.toString().replace(/px/g, '');
			this.settings.height		= this.settings.height.toString().replace(/px/g, '');
			this.settings.position.top	= this.settings.position.top.toString().replace(/px/g, '');
			this.settings.position.left	= this.settings.position.left.toString().replace(/px/g, '');
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
			if(this.support_css3_attr('backgroundSize') == false){ // old browsers need to do calculation to perform same output like "background-size: cover"
				this.nonCss3Supported_method(this.element, this.settings);
			}else{ // modern browsers that support CSS3 would be easier
				this.css3Supported_method(this.element, this.settings);
			}
		},

		kill: function(_this){
			if($.data( _this, "plugin_" + pluginName )){
				$(_this).prev().remove();
				$(_this)
					.removeAttr('style') // first, remove all the styles first
					.attr('style', $(_this).data('original-styles')) // then re-store the original styles
					.removeData('original-styles') // remove data that stores the original stylings before the image being rendered
					.removeData('plugin_' + pluginName); // remove data that stored during plugin initialization
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
						imgContainer = $('<div />');
				
					$(imgContainer)
						.insertBefore($(_this))
						.append($(newImg.obj))
						.css({
							'position'	: 'relative',
							'overflow'	: 'hidden',
							'width'		: (pw == '%') ? options.width : options.width + 'px',
							'height'	: (ph == '%') ? options.height : options.height + 'px'
						});

					if(newImg.size.width > newImg.size.height){ // horizontal

						$(newImg.obj).css({
							'width'			: 'auto',
							'max-height'	: 99999999,
							'min-height'	: 0,
							'max-width'		: 99999999,
							'min-width'		: 0,
							'height'		: $(newImg.obj).parent().height() + 'px'
						});
						
						var ratio = $(newImg.obj).height() / $(newImg.obj).width(); // get ratio
						
						if( $(newImg.obj).width() < $(newImg.obj).parent().width() ){
							$(newImg.obj).css({
								'width': $(newImg.obj).parent().width(),
								'height': parseFloat($(newImg.obj).parent().width() * ratio)
							});
						}

					}else{ // vertical
						
						$(newImg.obj).css({
							'width'			: $(newImg.obj).parent().width() + 'px',
							'max-height'	: 99999999,
							'min-height'	: 0,
							'max-width'		: 99999999,
							'min-width'		: 0,
							'height'		: 'auto'
						});
						
						var ratio = $(newImg.obj).width() / $(newImg.obj).height(); // get ratio
						
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
						'position'		: 'absolute',
						'top'			: posTop,
						'margin-top'	: function(){
							if(that.percentOrPixel(options.position.top) == '%'){
								return '-' + parseFloat(($(newImg.obj).height() / 100) * options.position.top.slice(0,-1)) + 'px'
							}
						},
						'left'			: posLeft,
						'margin-left'	: function(){
							if(that.percentOrPixel(options.position.left) == '%'){
								return '-' + parseFloat(($(newImg.obj).width() / 100) * options.position.left.slice(0,-1)) + 'px'
							}
						}
					});
					
					$(imgContainer)
						.hide()
						.addClass(options.classname);

					if(options.showoncomplete == true){
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
											.addClass(options.classname);
				
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

				if(options.showoncomplete == true){
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
					typeof $(_this).attr('src') == 'undefined' || 
					$(_this).attr('src') == ''
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
			}else{
				if(typeof options == 'string'){
					new Plugin( this, options );
				}
			}
		});
	};

})( jQuery, window, document );