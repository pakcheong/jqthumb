#jQThumb v2.3.6

Create thumbnails from images proportionally. On top of that, this is alaso a lazy-load plugin, which even works on IE6 from jQuery >=v1.3 or Zepto (with zepto-data plugin) >=v1.1.3.

![screenshot](screenshots/screenshot.jpg?raw=true "jQThumb Screenshot")

#USAGE
```html
<!DOCTYPE html>
<html lang="en">
    <body>
        <div style="width: 100%; height: 400px;">
            <img src="path/picture.jpg" class="example1" />
        </div>
        <div style="width: 400px; height: 400px;">
            <img src="path/picture.jpg" class="example2" />
        </div>
        <button id="kill">Kill</button>
        <button id="kill-all">Kill All</button>
    </body>
    <script type="text/javascript" src="scripts/jquery.min.js"></script>
    <script type="text/javascript" src="scripts/jqthumb.min.js"></script>
    <script type="text/javascript">
        $(function(){

            // plugin initialization
            $('img').jqthumb({
                classname      : 'jqthumb',             // class name. DEFUALT IS jqthumb
                width          : '100%',                // new image width after cropping. DEFAULT IS 100px.
                height         : '100%',                // new image height after cropping. DEFAULT IS 100px.
                position       : {
                    x : '50%',                          // x position of the image. DEFAULT is 50%. 50% also means centerize the image.
                    y : '50%'                           // y position of the image. DEFAULT is 50%. 50% also means centerize the image.
                },
                source         : 'src',                 // to specify the image source attribute. DEFAULT IS src.
                show           : false,                 // TRUE = show immediately after processing. FALSE = do not show it. DEFAULT IS TRUE.
                renderPosition : 'before',              // available: "before" and "after".
                onDemand       : false,                 // TRUE = load image only when scolling position has reached the DOM
                onDemandEvent  : 'scroll',              // available: "scroll", "click", "mouseenter". DEFAULT IS "scroll"
                threshold      : 0,                     // used when "onDemand" is set to true AND "onDemandEvent" is set to "scroll". Eg. Start loading the image 200px before scolling position reaches the DOM. DEFUALT IS 0
                responsive     : 20,                    // used by older browsers only. 0 to disable. DEFAULT IS 20
                zoom           : 1,                     // zoom the output, 2 would double of the actual image size. DEFAULT IS 1
                method         : 'auto',                // 3 methods available: "auto", "modern" and "native". DEFAULT IS auto
                reinit         : true,                  // TRUE = to re-init when images is re-initialized for the second time. FALSE = nothing would happen.
                error          : function(dom, imgUrl){ // callback on error, returns image url
                    console.log(dom, ' with its url "' + imgUrl + '" is invalid.');
                }
                before         : function(oriImage){    // callback before each image starts processing.
                    alert("I'm about to start processing now...");
                },
                after          : function(imgObj){      // callback when each image is cropped.
                    console.log(imgObj);
                },
                done           : function(imgArray){    // callback when all images are cropped.
                    for(i in imgArray){
                        $(imgArray[i]).fadeIn();
                    }
                }
            });

            // kill command
            $('#kill').click(function(){
                $('.your-dom').jqthumb('kill');
            });

            // kill all command
            $('#destroy-all').click(function(){
                $.jqthumb('killall');
            });
        });
    </script>
</html>
```

##INTRODUCTION
This is a plugin helps creating thumbnails proportionally from images. As many of you may know that `background-size: cover;` would solve most of the major issues when dealing with thumbnails. But `background-size: cover;` does not work in older browsers like IE6, 7 and 8 therefore this is one of the reasons why this plugin was built.

Ever wonder how to support full-width billboard in older browsers that works the same as modern browser? This plugin helps exactly in this. Never assume this plugin only generates thumbnails, in fact this works perfectly with big images like billboards. On top of that, the plugin also comes with lazy-load feature.

##BOWER
`bower install jqthumb`

##DEMO
http://pakcheong.github.io/jqthumb/

##DEFAULT OPTIONS
```javascript
$.fn.jqthumb.defaults = {
    classname      : 'jqthumb',
    width          : 100,
    height         : 100,
    position       : { x: '50%', y: '50%' },
    source         : 'src',
    responsive     : 20,
    zoom           : 1,
    show           : true,
    renderPosition : 'before',
    onDemand       : false,
    onDemandEvent  : 'scroll',
    threshold      : 0,
    method         : 'auto',
    reinit         : true,
    error          : function(){},
    before         : function(){},
    after          : function(){},
    done           : function(){}
};
```

##OPTION REFERENCES

####source
The image path attribute of the HTML tag. The source for `<img src="path/image.jpg" />` would be `src`.
```javascript
$('img').jqthumb({
    source : 'attr-src' // DEFAULT: src
});
```

####classname
The class name of the generated thumbnail. This is useful when you want to attach extra stylings to the thumbnail.
```javascript
$('img').jqthumb({
    classname : 'jqthumb-class-name' // DEFAULT: jqthumb
});
```

####width & height
The width of the generated thumbnail. This accepts both integer and string data types. Integer input would mean the width of the thumbnail is in pixel rather than percentage and vice versa. You may also set both to `auto` which means you're defining the ouput same as the actual resolution of the file. **Note: if you define width and/or height in percentage, make sure you have a container with width and/or height defined in pixels.**
```javascript
$('img').jqthumb({
    width  : 200,   // DEFAULT: 100
    height : '100%' // DEFAULT: 100
});
```

####position
This has to be defined as an object with **x** and **y** as its keys. **y** would be used to adjust the top-bottom position of the thumbnail and **x** adjusts left and right. **Note: both position.x and position.y must be within the range of the defined `width` and `height` respectively. If you are defining `position.x` and/or `position.y` in percenrage values instead, make sure it is within 0 to 100%**
```javascript
$('img').jqthumb({
    position: {
        x : 20,   // DEFAULT: '50%'
        y : '30%' // DEFAULT: '50%'
    }
});
```

####show
Whether to show the thumbnail right after processing.
```javascript
$('img').jqthumb({
    show : false // DEFAULT: true
});
```

####renderPosition
Render image whether before or after the selected DOM.
```javascript
$('img').jqthumb({
    renderPosition : 'after' // DEFAULT: 'before'
});
```

####onDemand / onDemandEvent / threshold
Asign an event to tell when to load the images. For eg., setting the event to "scroll" is a common action as you might want to load the images only when its DOM is within the viewport. Therefore, images will not start loading/processing until the scrolling position has reached the DOM. This is good when you have a lot of images on the page but user doesn't actually look through the entire site, so no point loading all at once.

`threshold`: Used only when `onDemand` is enabled AND `onDemandEvent` is set to "scroll". The scroll event will be triggered once the scrolling position has reached the DOM. For eg., you might want to load the images without users knowing it, so you will need to set `threshold` to maybe "200" which means images will start loading 200PX before (all directions including top, left, bottom, right) before scrolling position reaches the DOM.

`onDemandEvent`: has three possible inputs, "scroll", "click" and "mouseenter". Clicking and mouse hovering events mean that the images will only start loading when selected event is being triggered. For eg., setting `onDemandEvent` to "mouseenter" will lead image to start loading when users move the mouse cursor over it.
```javascript
$('img').jqthumb({
    onDemand      : true,     // DEFAULT: false
    onDemandEvent : 'scroll', // DEFAULT: scroll
    threshold     : 100       // DEFAULT: 0
});
```

####responsive
This is only needed by browsers that don't support CSS3. To accomplish responsive effect on older browsers, this plugin needs to do a re-calculation when `$(window).resize()` event is fired. The higher the number is the slower thumbnail gets re-calculated. 0 (zero) disables responsive feature in older browsers. **`modern` method does not support disabling responsive feature, use `method :"native"` would disable it.**
```javascript
/* responsive only works for native method / older browsers */
$('img').jqthumb({
    responsive : 10 // DEFAULT: 20
});

/* to disable responsive feature in modern method / browsers, switch method to native */
$('img').jqthumb({
    method     : 'native', // DEFAULT: auto
    responsive : 0         // DEFAULT: 20
});
```

####zoom
To zoom-in and out the thumbnail.
```javascript
$('img').jqthumb({
    zoom : 3 // DEFAULT: 1
});
```

####method
This plugin was built in two methods which one is for browsers that support CSS3 and another one is a native method that is fully done in mathematical calculation and it's for older browsers like IE6+ and browsers that don't support CSS3. Either one would have an identical result. In some cases, you might want to change the method to test or whatever. By default, the plugin detects your browsers compatability and assign method accordingly.
```javascript
$('img').jqthumb({
    method : 'native' // Availability: "auto", "modern", "native". DEFAULT: auto
});
```

####reinit
This lets the plugin know what to do when an image is intialized for the second time. By default, reinitiallization is enabled and the image will be killed and re-rendered. If set to `false`, nothing would happen.
```javascript
$('img').jqthumb({
    reinit : true // Availability: true / false. DEFAULT: true
});
```

####error
This callback returns the DOM and its image URL when error occurs.
```javascript
$('img').jqthumb({
    error : function(dom, imgUrl){
        console.log(dom, ' with its url "' + imgUrl + '" is invalid.');
    }
});
```

####before
This is a callback function which will be called right before calculation started. This function returns the original image source/object as its parameter. If you initialize the plugins with multiple-objects classname then this would be called for multiple times.
```javascript
$('img').jqthumb({
    before : function(originalImage){
        console.log(originalImage);
    }
});
```

####after
This is a callback function which will be called after everything is finished. This function returns the new generated thumbnail object as its parameter. If you initialize the plugin with multiple-objects classname then this would be called for multiple times.
```javascript
$('img').jqthumb({
    after : function(newThumb){
        $(newThumb).fadeIn();
    }
});
```

####done
This is a callback function which will be called when all objects have finished processing in a single plugin initialization. This returns an array type parameter that contains the object of all generated thumbnails.
```javascript
$('img').jqthumb({
    done : function(thumbnails){
        for(i in thumbnails)
            $(thumbnails[i]).fadeIn();
    }
});
```

##COMMANDS
```javascript
$('img').jqthumb('kill'); // destroy the plugin
$.jqthumb('killall');     // destroy all generated thumbnails on the page
```

##SEO IMPACT
You might be worried the SEO impact if you were to use this plugin. Maybe thought that changing `<img src="http://example.com/picture.jpg"/>` to `<img attr-src="http://example.com/picture.jpg"/>` would probably cause search engines not being able to crawl the images. Yes, it's right but not completely. You can always your `<noscript><img src="http://example.com/picture.jpg"/></noscript>` to output the image for search engines. Here are two examples:
```html
...
<img class="example" attr-src="http://example.com/picture.jpg" />
<noscript>
    <img src="http://example.com/picture.jpg" />
</noscript>
...
<script type="text/javascript">
    $(function(){
        $('.example[attr-src]').jqthumb({
            width  : 300,
            height : 200
        });
    });
</script>
```
Or a simplified version:
```html
...
<noscript attr-src="http://example.com/picture.jpg">
    <img src="http://example.com/picture.jpg" />
</noscript>
...
<script type="text/javascript">
    $(function(){
        $('noscript[attr-src]').jqthumb({
            width  : 300,
            height : 200
        });
    });
</script>
```

##TESTED BROWSERS
1. Google Chrome
2. Mozilla Firefox
3. Safari
4. Internet Explorer 6, 7, 8, 9 and 10

##EVEN MORE SAMPLE USAGE
```html
...
<img src="path/image.jpg" />
...
<script type="text/javascript">
    $(function(){
        $('img').jqthumb({
            width  : 300,
            height : 200
        });
    });
</script>
```

```html
...
<div data-jqthumb-src="path/image.jpg"></div>
...
<script type="text/javascript">
    $(function(){
        $('div').jqthumb({
            source : 'data-jqthumb-src'
        });
    });
</script>
```

```html
...
<div style="width: 100%; height:500px;">
    <img src="path/image.png" />
</div>
...
<script type="text/javascript">
    $(function(){
        $('div').jqthumb({
            width  : '100%',
            height : '100%'
        });
    });
</script>
```

```html
...
<img class="my-img" data-jqthumb-src="path/image1.png" data-jqthumb-width="200" data-jqthumb-height="200" />
<img class="my-img" data-jqthumb-src="path/image2.png" data-jqthumb-width="200" data-jqthumb-height="180" />
<img class="my-img" data-jqthumb-src="path/image3.png" data-jqthumb-width="200" data-jqthumb-height="160" />
<img class="my-img" data-jqthumb-src="path/image4.png" data-jqthumb-width="200" data-jqthumb-height="140" />
<img class="my-img" data-jqthumb-src="path/image5.png" data-jqthumb-width="200" data-jqthumb-height="120" />
...
<script type="text/javascript">
    $(function(){
        $('.my-img').each(function(){
            var $img = $(this);
            $img.jqthumb({
                source : $img.attr('data-jqthumb-src'),
                width  : $img.attr('data-jqthumb-width'),
                height : $img.attr('data-jqthumb-height')
            });
        });
    });
</script>
```

```html
...
<img class="my-img" src="path/image.jpg" />
...
<script type="text/javascript">
    $(function(){
        $('.my-img').jqthumb({
            width  : 300,
            height : 300,
            show   : false, // By default the image would be shown immediately after processing. To disable, set it to false
            after  : function(croppedImg){ // This callback returns an object
                $(croppedImg).fadeIn(); // This would fade in the cropped image
            }
        });
    });
</script>
```

```html
...
<img class="my-img" src="path/image1.jpg" />
<img class="my-img" src="path/image2.jpg" />
<img class="my-img" src="path/image3.jpg" />
...
<script type="text/javascript">
    $(function(){
        $('.my-img').jqthumb({
            width  : 300,
            height : 300,
            show   : false, // By default the image would be shown immediately after processing. To disable, set it to false
            done   : function(allCroppedImgs){ // This callback returns an array
                for(i in allCroppedImgs){
                    $(allCroppedImgs[i]).fadeIn(); // This would fade in the cropped images one by one
                }
            }
        });
    });
</script>
```