jQThumb V1.4
======================================

Create thumbnails from images proportionally. It even works on IE6 from jQuery V1.3 and above.

USAGE:

	$('img').jqthumb({
		classname      : 'jqthumb',        // class name. DEFUALT IS jqthumb
		width          : 100,              // new image width after cropping. DEFAULT IS 100px.
		height         : 100,              // new image height after cropping. DEFAULT IS 100px.
		position: {
			top  : '50%',                  // position of the image. DEFAULT is 50%.
			left : '50%'                   // position of the image. DEFAULT is 50%.
		},
		source         : 'src',            // to specify the image source attribute. DEFAULT IS src.
		showoncomplete : false,            // TRUE = show immediately after processing. FALSE = do not show it. DEFAULT IS TRUE.		
		before         : function(){       // callback before processing.
			alert('I'm about to start processing now...');
		},	
		after          : function(imgObj){ // callback when ONE image is cropped.
			$(imgObj).fadeIn();
		},
		complete       : function(){       // callback when ALL images are cropped.
			alert('Done!');
		}
	});


Tested Browsers:
======================================
1. Google Chrome
2. Mozilla Firefox
3. Safari
4. Internet Explorer 6, 7, 8, 9 and 10


Demo:
======================================
http://pakcheong.github.io/jqthumb/
