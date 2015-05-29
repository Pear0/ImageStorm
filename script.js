/*jshint browser:true */
/*global $:false, jQuery:false, console:false */

$(function () {
    console.log("JS Loaded");

    var query = "cat";

    if (location.hash != "" && location.hash != "#")
        query = location.hash.substr(1);

    var imgs = [];

    function loadImage(url) {
        var img = document.createElement("img");
        img.src = url;
        img.className = "image";
        img.onload = function () {
            console.log("Loaded \"" + url + "\"");
            img.style.top = "-250px";

            imgs.push(img);

            document.body.appendChild(img);
        };
        img.style.left = Math.round(Math.random() * 100) + "%";

    }

    setInterval(function () {
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];

            var h = (parseInt(img.style.top.match(/-?\d+/g)) + 1);

            if (h > document.body.clientHeight + 300) {
                h = -250;
                img.style.left = Math.round(Math.random() * 100) + "%";
            }


            img.style.top = h + "px";

        }

        if (location.hash != "#" + query)
            location.reload();

    }, 10);

    function requestJSON(index) {

        $.ajax({
                url: "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + escape(query) + "&rsz=8&start=" + index,
                type: 'GET',
                crossDomain: true,
                dataType: 'jsonp'
            })
            .done(function (data) {

                var json = data;

                if (json.responseStatus == 200) {
                    var images = json.responseData.results;

                    for (var i = 0; i < images.length; i++)(function () {
                        var img = images[i];

                        setTimeout(function () {
                            loadImage(img.url);

                        }, (index + i) * Math.round(500 + Math.random() * 500));

                    })();

                    requestJSON(index + 8);
                }

            });


    }

    requestJSON(0);


});