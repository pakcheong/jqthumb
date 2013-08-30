/*
	Copyright (c) 2013-2013 Tho Pak Cheong
	Version: 1.0 (26-AUG-2013)
	Dual licensed under the MIT and GPL licenses.
	Requires: jQuery v1.2.5 or later
*/
(function ($){
	var defaults = {
		classname: 'jqthumb',
		width: 100,
		height: 100,
		showoncomplete: true,
		complete: function(){}
	};
	
	var methods = {
		/* EXECUTE PLUGIN */
		init: function (_options){
		
			options = $.extend({}, defaults, _options); // replace _options with the default ones, and assign it to "options" which is a global variable

			return this.each(function(){

				var _this = $(this);
				
				$(_this).one('load', function() {
					methods.makethumbnail($(_this));
				}).each(function() {
					if(this.complete) { // fix cached images for not going through .load() in IE
						$(this).load();
					}
				});

			});
		},

		makethumbnail: function(_this){
			$(_this).hide();

			if(methods.support_css3_attr('backgroundSize') == false){ // old browsers need to do calculation to perform same output like "background-size: cover"

				$(_this).parent().css({
					'position': 'relative',
					'overflow': 'hidden',
					'width': options.width + 'px',
					'height': options.height + 'px'
				});
				
				var oriImg = {
					obj: $(_this),
					size: methods.getActualSize( $(_this) )// get actual size
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
				options.complete.call(this, $(oriImg.obj));

			}else{// modern browsers that support CSS3

				if (methods.percentOrPixel(options.width) == '%') { // width is in percentage
					$(_this).parent().css({
						'width': options.width
					});
				}else{
					$(_this).parent().css({
						'width': options.width + 'px'
					});
				}

				if (methods.percentOrPixel(options.height) == '%') { // height is in percentage
					$(_this).parent().css({
						'height': options.height
					});
				}else{
					$(_this).parent().css({
						'height': options.height + 'px'
					});
				}

				var featuredBgImg = $('<div/>').css({
					'width': '100%',
					'height': '100%',
					'background-image': 'url("' + $(_this).attr('src') + '")',
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
				options.complete.call(_this, $(featuredBgImg));
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
			tempImg.src = imgObj.attr("src");
			imgObj = {
				width: tempImg.width,
				height: tempImg.height
			}
			return imgObj;
		},

		support_css3_attr: (function() {
			/* code availabel at http://net.tutsplus.com/tutorials/html-css-techniques/quick-tip-detect-css-support-in-browsers-with-javascript/ */
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

	$.fn.jqThumb = function (method){
		if(methods[method]){
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}else if(typeof method === 'object' || !method){
			return methods.init.apply(this, arguments);
		}else{
			$.error('Method ' + method + ' does not exist on jQuery.mobileappsau');
		}
	};
})(jQuery);