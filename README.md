jQThumb V1.3.5
======================================

Create thumbnails from images proportionally. It even works on IE6 from jQuery V1.3 and above.

USAGE:

	$('img').jqthumb({
		classname      : 'jqthumb',        // class name. DEFUALT IS jqthumb
		width          : 100,              // new image width after cropping. DEFAULT IS 100px.
		height         : 100,              // new image height after cropping. DEFAULT IS 100px.
		source         : 'src',            // to specify the image source attribute. DEFAULT IS src.
		showoncomplete : false,            // TRUE = show immediately after processing. FALSE = do not show it. DEFAULT IS TRUE.		
		eachcomplete   : function(imgObj){ // callback when ONE image is cropped.
			$(imgObj).fadeIn();
		},
		allcomplete    : function(){       // callback when ALL images are cropped.
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
