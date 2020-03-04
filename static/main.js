(function () {
    $(document).ready(function () {
        var timelineAnimate;
        timelineAnimate = function (elem) {
            return $(".timeline.animated .timeline-row").each(function (i) {
                var bottom_of_object, bottom_of_window;
                bottom_of_object = $(this).position().top + $(this).outerHeight();
                bottom_of_window = $(window).scrollTop() + $(window).height();
                if (bottom_of_window > bottom_of_object) {
                    return $(this).addClass("active");
                }
            });
        };
        timelineAnimate();
        return $(window).scroll(function () {
            return timelineAnimate();
        });
    });
}).call(this);

var degree = -90;
window.setInterval(() => {
    $(document.body).attr("style", "background-image: linear-gradient(" + degree + "deg, rgb(0, 132, 255), rgb(255, 0, 0));")
    degree += 1;
}, 10);

