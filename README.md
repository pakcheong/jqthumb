# jQThumb V2.1.2 #

Create thumbnails from images proportionally. It even works on IE6 from jQuery >=v1.3 or Zepto (with zepto-data plugin) >=v1.1.3.

![screenshot.jquery.png](http://pakcheong.github.io/jqthumb/demo/demo.jpg)


#USAGE
```html
<!DOCTYPE html>
<html lang="en">
    <body>
        <div style="width: 100%; height: 400px;">
            <img src="path/picture.jpg"/>
        </div>
        <div style="width: 400px; height: 400px;">
            <img src="path/picture.jpg"/>
        </div>
    </body>
    <script type="text/javascript" src="scripts/jquery.min.js"></script>
    <script type="text/javascript" src="scripts/jqthumb.min.js"></script>
    <script type="text/javascript">
        $('img').jqthumb({
            classname      : 'jqthumb',             // class name. DEFUALT IS jqthumb
            width          : '100%',                // new image width after cropping. DEFAULT IS 100px.
            height         : '100%',                // new image height after cropping. DEFAULT IS 100px.
            position       : {
                x : '50%',                          // x position of the image. DEFAULT is 50%. 50% also means centerize the image.
                y : '50%'                           // y position of the image. DEFAULT is 50%. 50% also means centerize the image.
            },
            source         : 'src',                 // to specify the image source attribute. DEFAULT IS src.
            showoncomplete : false,                 // TRUE = show immediately after processing. FALSE = do not show it. DEFAULT IS TRUE.
            responsive     : 20,                    // used by older browsers only. 0 to disable. DEFAULT IS 20
            zoom           : 1,                     // zoom the output, 2 would double of the actual image size. DEFAULT IS 1
            method         : 'auto',                // 3 methods available: "auto", "css3" and "native". DEFAULT IS auto
            before         : function(oriImage){    // callback before each image starts processing.
                alert("I'm about to start processing now...");
            },
            after          : function(imgObj){      // callback when each image is cropped.
                console.log(imgObj);
            },
            done           : function(imgArray){    // callback when all images are cropped.
                for(var i=0; i<imgArray.length; i++){
                    $(imgArray[i]).fadeIn();
                }
            }
        });
    </script>
</html>
```

#INTRODUCTION
This is a plugin helps creating thumbnails proportionally from images. As many of you may know that ```background-size: cover;``` would solve most of the major issues when dealing with thumbnails. But ```background-size: cover;``` does not work in older browsers like IE6, 7 and 8 therefore this is one of the reasons why this plugin was built.

Ever wonder how to support full-width billboard in older browsers that works the same as modern browser? This plugin helps exactly in this. Never assume this plugin only generates thumbnails, in fact this works perfectly with big images like billboards.

#Bower
```bower install jqthumb```

#Demo
http://pakcheong.github.io/jqthumb/

#OPTION REFERENCES
###classname
The class name of the generated thumbnail. This is useful when you want to attach extra stylings to the thumbnail.

**Example**: ```classname : 'my-thumb'```

**Default**: ```jqthumb```
***

####width & height
The width of the generated thumbnail. This accepts both integer and string data types. Integer input would mean the width of the thumbnail is in pixel rather than percentage and vice versa. **Note: if you define width and/or height in percentage, make sure you have a container with width and/or height defined in pixels.**

**Example**: ```width: 100``` / ```height: 50%```

**Default**: ```100```
***

####position
This has to be defined as an object with **x** and **y** as its keys. **y** would be used to adjust the top-bottom position of the thumbnail and **x** adjusts left and right.

**Example**: ```position: { x: '0%', y: '50%' }```

**Default**: ```50%``` for both x and y
***

####source
The image path attirbute of the HTML tag. The source for ```<img src="path/image.jpg"/>``` would be ```src```.

**Example**: ```source: 'attr-src'```

**Default**: ```src```
***

####showoncomplete
Whether to show the thumbnail right after processing.

**Example**: ```showoncomplete: true```

**Default**: ```true```
***

####responsive
Modern browsers are using the method of CSS3 to complete most of the jobs and therefore repsonsive works without extra codes. However, older browsers like IE6, 7 and 8 are depending on another method. To accomplish responsive feature in older browsers, this option is needed. The higher the number is the slower thumbnail gets re-calculated. ```0``` (zero) disables responsive feature in older browsers.

**Example**: ```responsive: 30```

**Default**: ```20```
***

####zoom
To zoom-in and out the thumbnail.

**Example**: ```zoom: 2```

**Default**: ```1```
***

####method
This plugin was built in two methods which one is for browsers that support CSS3 and another one is for older browsers. Either one would have an identical result. In some cases, you might want to change the method to test or whatever. By default, the plugin detects your browsers compatability and assign method accordingly.

**Example**: ```method: 'native'```

**Default**: ```method: 'auto'```
***

####before
This is a callback function which will be called right before calculation started. This function returns the original image source/object as its parameter. If you initialize the plugins with multiple-objects classname then this would be called for multiple times.

**Example**: ```before: function(oriImage){}```

**Default**: ```before: function(){}```
***

####after
This is a callback function which will be called after everything is finished. This function returns the new generated thumbnail object as its parameter. If you initialize the plugin with multiple-objects classname then this would be called for multiple times.

**Example**: ```after: function(imgObj){ $(imgObj).fadeIn(); }```

**Default**: ```after: function(){}```
***

####done
This is a callback function which will be called when all objects have finished processing in a single plugin initialization. This returns an array type parameter that contains the object of all generated thumbnails.

**Example**:
```javascript
done: function(thumbnails){
    for(var i=0; i<thumbnails.length; i++){
        $(thumbnails[i]).fadeIn();
    }
}
```

**Default**: ```done: function(){}```
***

##Destory the plugin
**Example**: ```$('img').jqthumb('kill');```
***

##Kill / destroy all thumbnails in one go
**Example**: ```$.jqthumb('killall');```
***

##Tested Browsers:
1. Google Chrome
2. Mozilla Firefox
3. Safari
4. Internet Explorer 6, 7, 8, 9 and 10
