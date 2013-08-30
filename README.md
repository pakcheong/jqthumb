jQThumb
=======

Create thumbnails from images proportionally. It even works on IE6 from jQuery V1.2.5 and above. I have also tested it with Zepto.js, and it worked perfectly.

USAGE:

	$('img').jqthumb({
		classname: 'jqthumb', // class name. DEFUALT IS jqthumb
		width: 100, // new image width after cropping. DEFAULT IS 100px.
		height: 100, // new image height after cropping. DEFAULT IS 100px.
		showoncomplete: false, // TRUE = show immediately after processing. FALSE = do not show it. DEFAULT IS TRUE.
		complete: function(imgObj){ // a callback when cropping has completed.
			$(imgObj).fadeIn();
		}
	});
