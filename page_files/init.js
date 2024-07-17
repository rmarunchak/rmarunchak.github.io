const low_vision_font_sizes = [ 1, 1.2, 1.4, 1.6, 1.8, 2 ];
var forbidden_domains = [ 'mail.ru', 'yandex.ru' ];

$(function () {
    $.fn.select2.defaults.set('language', 'uk');
    $.fn.select2.defaults.set('width', 'resolve');

    setDateSettings();

    $(document).on('focusin', function (e) {
        if ($(e.target).closest(".mce-window, .moxman-window").length) {
            e.stopImmediatePropagation();
        }
    });

    $('input,select,textarea', $('#content')).change(function () {
        $(this).removeClass('errorInput')
    });

    $('#wrapper #main-menu #toggle-low-vision').click(function () {
        brownies.cookies.low_vision = !brownies.cookies.low_vision;
        $('#low-vision-panel').toggle();
        changeLowVision();
    });

    $('#low-vision-panel-color > button').click(function () {
        brownies.cookies.lv_color = $(this).attr('lv-color');

        changeLowVision();
    });

    $('#low-vision-panel-font #low-vision-panel-font-inc').click(function () {
        var lv_font = brownies.cookies.lv_font;
        if (!lv_font) lv_font = 0;
        if (lv_font < low_vision_font_sizes.length - 1) lv_font++;
        brownies.cookies.lv_font = lv_font;

        changeLowVision();
    });

    $('#low-vision-panel-font #low-vision-panel-font-0').click(function () {
        brownies.cookies.lv_font = 0;

        changeLowVision();
    });

    $('#low-vision-panel-font #low-vision-panel-font-dec').click(function () {
        var lv_font = brownies.cookies.lv_font;
        if (!lv_font) lv_font = 0;
        if (lv_font > 0) lv_font--;
//        if (lv_font == 0) $(this).prop('disabled', true);
        brownies.cookies.lv_font = lv_font;

        changeLowVision();
    });

    $('#low-vision-panel #low-vision-panel-cataracta').click(function () {
        brownies.cookies.has_cataracta = !brownies.cookies.has_cataracta;
        changeLowVision();
    });


    changeLowVision();
});

function changeLowVision() {
    $('html').removeClass();
    $('html').css('font-size', '100%');

    if (brownies.cookies.low_vision) {
        $('#low-vision-panel').css('display', 'flex');

        $('html').addClass('low-vision');

        var lv_color = brownies.cookies.lv_color;
        if ($.inArray(lv_color, [ 'bw', 'wb', 'blue', 'beige' ]) == -1) lv_color = 'bw';
        $('html').addClass('low-vision-' + lv_color);

        var lv_font = brownies.cookies.lv_font;
        if (!lv_font || !low_vision_font_sizes[ lv_font ]) lv_font = 0;

        $('html').css('font-size', (low_vision_font_sizes[ lv_font ] * 100) + '%');

        if (brownies.cookies.has_cataracta)
            $('html').addClass('has_cataracta');
    }
}