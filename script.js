/*jshint browser:true */
/*global $:false, jQuery:false, console:false, escape:false */
var Query_, queries_;

$(function () {
    console.log("JS Loaded");

    function Query(q) {
        var self = this;
        this.query = q;
        this.imgs = [];
        this.urls = [];
        this.currentIndex = 0;
        var shouldStop = false;
        this.imagesExpire = true;

        this.loadImage = function (url) {
            if (shouldStop)
                return;
            var img = document.createElement("img");
            img.src = url;
            img.className = "image";
            img.onload = function () {
                img.style.top = -250 + "px";

                self.imgs.push(img);

                document.body.appendChild(img);
            };
            img.style.left = Math.round(Math.random() * 97) + "%";

        };

        this.intervalUpdateId = setInterval(function () {
            for (var i = 0; i < self.imgs.length; i++) {
                var img = self.imgs[i];

                var h = (parseInt(img.style.top.match(/-?\d+/g)) + 1);

                if (h > document.body.clientHeight + 300 || h == -825) {
                    h = -250 - Math.random(Math.random() * document.body.clientHeight);
                    img.style.left = Math.round(Math.random() * 100) + "%";
                    if (self.imagesExpire) {
                        self.imgs.splice(i, 1);
                        i--;

                        if (img.parentNode) {
                            img.parentNode.removeChild(img);
                        }

                        continue;
                    }

                }


                img.style.top = h + "px";

            }



        }, 10);

        this.newImage = function () {
            self.currentIndex++;
            if (self.currentIndex >= self.urls.length) {
                self.currentIndex = 0;
            }

            self.loadImage(self.urls[self.currentIndex]);

        };


        var requestJSON = function (index) {
            if (shouldStop)
                return;
            console.log("Requesting: " + self.query + "@" + index);

            $.ajax({
                    url: "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + escape(self.query) + "&rsz=8&start=" + index,
                    type: 'GET',
                    crossDomain: true,
                    dataType: 'jsonp'
                })
                .done(function (data) {
                    if (shouldStop)
                        return;


                    var json = data;

                    if (json.responseStatus == 200) {
                        var images = json.responseData.results;

                        for (var i = 0; i < images.length; i++) {
                            var img = images[i];

                            self.urls.push(img.url);

                        }

                        if (self.urls.length < 4000)
                            requestJSON(index + 8);


                    }

                });


        };
        requestJSON(0);

        this.stop = function () {
            shouldStop = true;
            clearInterval(self.intervalUpdateId);
            for (var i = 0; i < self.imgs.length; i++) {
                var node = self.imgs[i];
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }

            }
            self.imgs = [];
        };


    }

    Query_ = Query;

    var queries = [];
    queries_ = queries;

    var dealWithHash = function (hash) {
        hash = hash.substr(1);
        console.log("Hash changed to: " + hash);

        var qStrings = hash.split(";");
        if (hash === "")
            qStrings = [];
        var existing = [];
        var i;

        for (i = 0; i < queries.length; i++) {
            var query = queries[i];
            if ($.inArray(query.query, qStrings) == -1) {
                query.stop();

                queries.splice(i, 1);
                i--;
            } else {
                existing.push(query.query);
            }
        }

        console.log("Kept: " + existing);

        for (i = 0; i < qStrings.length; i++) {
            var qString = qStrings[i];
            if ($.inArray(qString, existing) == -1) {

                console.log("Adding: " + qString);
                queries.push(new Query(qString));

            }
        }
    };

    dealWithHash(location.hash);

    $(window).on("hashchange", function () {
        dealWithHash(location.hash);
    });

    setInterval(function () {
        var num = document.body.childNodes.length;
        var total = 0;

        for (var i = 0; i < queries.length; i++) {
            total += queries[i].urls.length;
        }

        document.title = "ImageStorm (" + num + " of " + total + ")";

    }, 1000);

    var qIndex = 0;

    setInterval(function () {
        if (queries.length === 0)
            return;

        qIndex++;
        if (qIndex >= queries.length) {
            qIndex = 0;
        }

        queries[qIndex].newImage();

    }, 300);


});
