let msgDataLoading = 'Зачекайте, йде обробка даних..'
let msgDataNotFound = 'Дані не знайдено'

let errInputElement = 'Неправильно вказано елемент'
let errInputEmpty = 'Поле <b><u>#name#</u></b> не заповнено!'
let errInputFormat = 'Поле <b><u>#name#</u></b> не вiдповiдає формату!'
let errInputNumeric = 'Поле <b><u>#name#</u></b> не містить число!'
let errInputInteger = 'Поле <b><u>#name#</u></b> не містить ціле число!'
let errInputNatural = 'Поле <b><u>#name#</u></b> не містить натуральне число!'
let errInputEMail = 'Поле <b><u>#name#</u></b> не містить правильний e-mail!'
let errInputEMailForbidden = 'Електронна пошта у полі <b><u>#name#</u></b> знаходиться на забороненому домені!'
let errInputPassword = 'Поле <b><u>#name#</u></b> має бути не коротшим 8 символів і містити цифру, велику і малу літери, спеціальний символ'

let clsActiveInput = 'activeInput'
let clsErrorInput = 'errorInput'

let rEMail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/
let rEMailS = "[-\\w\\._%+]+@[-\\.\\w]+\\.[A-Za-z]{2,}"

let s_letters = "qwertyuiopasdfghjklzxcvbnm" // Буквы в нижнем регистре
let b_letters = "QWERTYUIOPLKJHGFDSAZXCVBNM" // Буквы в верхнем регистре
let digits = "0123456789" // Цифры
let specials = "!@#$%^&*()_-+=\|/.,:;[]{}" // Спецсимволы

let msgPlaceholderRegion = 'Оберіть регіон'

let patterns = {
    'a': '^[- А-Яа-яІіЇїЄє\'\.]+$',
    'ax': '^[- А-Яа-яІіЇїЄє0-9\'\.\(\)№]+$',
    'a_en': '^[- A-Za-z\'\.]+$',
    'ax_en': '^[- A-Za-z0-9\'\.\(\)]+$',
    'ad': '^[- А-Яа-яІіЇїЄє\'\.\\\/0-9]+$',
    'd': '^[0-9]+$',
    //'email': '^([a-z0-9_\.-]+)@([a-z0-9_\.-]+)\.([a-z\.]{2,6})$',
    'email': '^[-\\w\\._%+]+@[-\\.\\w]+\\.[A-Za-z]{2,}$',
    'phone': '(999)999-99-99',
    'www': '[-:\/a-zA-Z0-9_%\.]+',
    'edrpo': '99999999',
    'iban': 'U\\A9{27}',
    'uin': '9{10,12}',
    'postindex': '99999'
}

function setDateSettings() {
    $.datepicker.setDefaults({
        changeYear: true,
        changeMonth: true,
        showOtherMonths: true,
        selectOtherMonths: true,
        firstDay: 1,
        monthNames: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
        monthNamesShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
        dayNames: ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота'],
        dayNamesShort: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        dayNamesMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        dateFormat: 'dd.mm.yy',
        yearRange: '-99:+1',
        buttonImage: '/img/calendar.gif',
        buttonImageOnly: true,
        showOn: 'both'
    });
}

function setDatepicker(elements) {
    setDateSettings()
    elements.each(function (i, el) {
        let $el = $(el), p = {}
        if ($el.attr('min')) p.minDate = new Date($el.attr('min'))
        if ($el.attr('max')) p.maxDate = new Date($el.attr('max'))
        $el.attr('type', 'text')
            .inputmask('dd.mm.yyyy', { "placeholder": "дд.мм.рррр" })
            .datepicker(p)
    })
}

function showError(msg) {
    let w = $('<div class="error" style="padding: 5px; min-height: 30px">' + msg + '</div>').dialog({
        modal: true,
        title: 'Помилка',
        width: 500,
        position: { my: 'center top+100', at: 'top' },
        open: function (event, ui) {
            $('.ui-widget-header', ui.dialog).addClass('error');
            $('.ui-dialog-titlebar-close', ui.dialog).attr('Title', 'Закрити');
        },
        close: function () {
            $(this).dialog('destroy').remove();
        },
        buttons: [
            {
                text: "Закрити",
                click: function () {
                    $(this).dialog("close");
                }
            }
        ]
    });
    return w;
}

function showMessage(msg, title, width, buttons) {
    let w = $('<div style="padding: 5px; min-height: 30px">' + msg + '</div>').dialog({
        closeOnEscape: true,
        title: title,
        modal: true,
        width: width ? width : 400,
        position: { at: 'center', my: 'center' },
        resizable: false,
        open: function (event, ui) {
            $('.ui-dialog-titlebar-close', ui.dialog).attr('Title', 'Закрити');
        },
        close: function () {
            $(this).dialog('destroy').remove();
        },
        buttons: buttons
    });
    //if (!title) w.parent().find('.ui-dialog-titlebar').hide();
    return w;
}

function ajaxError(jqXHR, e) {
    if (jqXHR.status === 0)
        return "Немає з'єдання з сервером";
    else if (jqXHR.status === 404)
        return "Сторінка не знайдена [404]";
    else if (jqXHR.status === 500)
        return "Помилка сервера [500]";
    else if (e === 'parsererror')
        return "Помилка обробки відповіді";
    else if ((jqXHR.status === 504) || (e === 'timeout'))
        return "Закінчився час очікування [504]";
    else if (e === 'abort')
        return "З'єдання перервано";
    else
        return jqXHR.responseText;
}

function sprintf(str, args) {
    for (k in args) str = str.replace('#' + k + '#', args[ k ]);
    return str;
}

function isInteger(val) {
    return !isNaN(parseInt(val)) && isFinite(val);
}

function isNatural(val) {
    return isInteger(val) && (val >= 0);
}

function isNumeric(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
}

function checkInputValues(pElements) {
    let msg = [];

    $.each(pElements, function () {
        if (this.elem && $(this.elem).is('input,select,textarea')) {
            let input = $(this.elem), val = $.trim(input.val()), err = '';
            let form = input.closest('form');

            let title = input.attr('caption');
            if (!title) title = $('label[for=' + input.attr('id') + ']', form).text();
            if (!title) title = input.prev('label').text();
            if (!title) title = input.next('label').text();
            if (!title) title = input.attr('id');
            if (title) title = $.trim(title.replace(':', ''));

            if ((val === 'undefined') || ($.trim(val) === '')) {
                if (!this.empty) err = sprintf(errInputEmpty, { name: title });
            } else {
                if (this.not0 && (parseInt(val) === 0))
                    err = sprintf(errInputEmpty, { name: title });
                if (this.natural && !isNatural(val))
                    err = sprintf(errInputNatural, title);
                else if (this.integer && !isInteger(val))
                    err = sprintf(errInputInteger, title);
                else if (this.numeric && !isNumeric(val))
                    err = sprintf(errInputNumeric, title);
                else if (this.email) {
                    if (/[^\u0000-\u007F]/.test(val) || !RegExp(rEMailS).test(val))
                        err = sprintf(errInputEMail, { name: title });
                    else if (checkEmailForbidden(val))
                        err = sprintf(errInputEMailForbidden, { name: title });
                } else if (this.password && !checkPassword(val)) {
                    err = sprintf(errInputPassword, { name: title });
                } else if (this.regexp && !this.regexp.test(val)) {
                    err = sprintf(errInputFormat, { name: title });
                }
            }

            if (err) {
                msg.push(err);
                input.addClass(clsErrorInput);
            } else
                input.removeClass(clsErrorInput);
        } else if (!this.optional)
            msg.push(errInputElement);
    });
    if (msg.length > 0) {
        showError(msg.join('<br>'));
        return false;
    } else
        return true;
}

function parseEmail(email) {
    let x = email.split('@')
    let z = x[ 1 ].split('.')
    return { name: x[ 0 ], domain: x[ 1 ], d1: z.slice(-1)[ 0 ], d2: z.slice(-2).join('.') }
}

function checkEmailForbidden(email) {
    return parseEmail(email).d1 == 'ru';
}

function checkPassword(pwd, l) {
    let is_s = false
    let is_b = false
    let is_d = false
    let is_sp = false

    let is_l = pwd.length >= 8

    for (let i = 0; i < pwd.length; i++) {
        /* Проверяем каждый символ пароля на принадлежность к тому или иному типу */
        if (!is_s && s_letters.indexOf(pwd[ i ]) != -1) {
            is_s = true
        } else if (!is_b && b_letters.indexOf(pwd[ i ]) != -1) {
            is_b = true
        } else if (!is_d && digits.indexOf(pwd[ i ]) != -1) {
            is_d = true
        } else if (!is_sp && specials.indexOf(pwd[ i ]) != -1) {
            is_sp = true
        }
    }
    return (is_l && is_s && is_b && is_d && is_sp)
}

function formatNumber(d) {
    if (!isFinite(this)) return this.toString();

    let a = this.toFixed(d).split('.');
    a[ 0 ] = a[ 0 ].replace(/\d(?=(\d{3})+$)/g, '$& ');
    return a.join('.');
}

function checkWordsInStringAND(words, string) {
    if (!words) return true;
    if (!string) return false;

    words = words.toLowerCase().split(' ');
    string = string.toLowerCase();
    for (let i = 0; i < words.length; i++)
        if (words[ i ] && (string.indexOf(words[ i ]) == -1)) return false;

    return true;
}

function checkWordsInString(words, string) {
    if (!words) return true;
    if (!string) return false;

    words = words.toLowerCase().split(',');
    string = string.toLowerCase();
    for (let i = 0; i < words.length; i++)
        if (words[ i ] && checkWordsInStringAND(words[ i ], string)) return true;

    return false;
}

function setPageHistory(new_title, new_url) {
    history.replaceState({}, new_title, new_url);
    document.title = new_title;
}

function refreshCaptcha(inp, img) {
    $(inp).val('');
    $(img).attr('src', '/_data.php?a=captcha&x=' + Math.random());
}

function loadScripts(scripts) {
    scripts.forEach(function (item, i) {
        let x = $.getScript(item).done(function () {
        });
    });
    return $.when.apply($, scripts);
}

function loadScriptsOrder(scripts) {
    scripts.forEach(function (item, i) {
        let x = $.getScript(item).done(function () {
        });
    });
    return $.when.apply($, scripts);
}

function str2date(s) {
    if (!s) return '';
    let d = new Date(s);
    if (!d) return '';
    let day = d.getDate(), month = d.getMonth();
    return (day <= 9 ? '0' : '') + day + '.' + (month < 9 ? '0' : '') + (month + 1) + '.' + d.getFullYear();
}

function str2year(s) {
    return (new Date(s)).getFullYear();
}

function htmlspecialchars(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function data2xml(parent, root, fields) {
    let field, name, value, xml;

    let data = '';// = '<?xml version="1.0" encoding="UTF-8"?>\n';
    if (root) data += '<' + root + '>';
    for (let i in fields) {
        if (isNatural(i)) {
            field = parent.find('#' + fields[ i ])
            xml = fields[ i ]
        } else {
            field = parent.find('#' + i);
            xml = fields[ i ] ? fields[ i ] : i;
        }

        value = '';
        if (field.length === 0) {
            alert('Не знайдено поле ' + name);
        } else if (field.is(':disabled')) {
        } else if (field.is(':checkbox')) {
            value = field.prop('checked') ? 1 : 0;
        } else if (field.is('input,select,textarea')) {
            value = htmlspecialchars($.trim(field.val()));
        } else
            value = $('<div/>').text($.trim(field.text())).html();

        data += '<' + xml + '>' + value + '</' + xml + '>';
    }
    if (root) data += '</' + root + '>';
    return data;
}

function regionChanged(regions, areas, koatuu) {
    let $areas = $(areas, $form)
    $areas.select2('destroy');
    $areas.html('').prop('disabled', true);

    let $koatuu = $(koatuu, $form);
    $koatuu.select2('destroy');
    $koatuu.html('').prop('disabled', true);
    $koatuu.select2();

    let region_id = $(regions).val();
    if (!region_id) return;

    $.ajax({
        url: 'https://registry.edbo.gov.ua/api/koatuu/', method: 'GET', dataType: 'json',
        data: { 'a': 'koatuu', 'k': region_id.substring(0, 2) + '___00000' }
    })
        .done(function (data) {
            if (data.error) {
                showError('Помилка завантаження');
                return false;
            } else {
                for (id in data) {
                    $('<option value="' + id + '" d="' + data[ id ][ 2 ] + '">' + data[ id ][ 0 ] + '</option>').appendTo($areas);
                }
                $areas.prop('disabled', false);
                if ($areas.attr('value')) $areas.val($areas.attr('value'))
                $areas.select2();

                areaChanged(areas, koatuu);
            }
        })
        .fail(function (jqXHR, e) {
            showError(ajaxError(jqXHR, e));
        });
}

function areaChanged(areas, koatuu) {
    let $areas = $(areas, $form)
    let $koatuu = $(koatuu, $form);
    $koatuu.select2('destroy');
    $koatuu.html('').prop('disabled', true);

    let $area = $('option:selected', $areas);

    if (+$area.attr('d') >= 0) {
        $.ajax({
            url: 'https://registry.edbo.gov.ua/api/koatuu/', method: 'GET', dataType: 'json',
            data: { 'a': 'koatuu', 'k': $area.attr('value').substring(0, 5) + '_____' }
        })
            .done(function (data) {
                if (data.error) {
                    showError('Помилка завантаження');
                    return false;
                } else {
                    //$('<option></option>').appendTo($koatuu);
                    let t = 0;
                    for (id in data) {
                        t = Math.max(t, data[ id ][ 0 ]);
                        $('<option value="' + id + '">' + data[ id ][ 0 ] + '</option>').appendTo($koatuu);
                    }
                    $koatuu.prop('disabled', false);
                    if ($koatuu.attr('value')) $koatuu.val($koatuu.attr('value'))
                    $koatuu.select2(/*{ placeholder: t == 3 ? msgPlaceholderKOATUU3 : msgPlaceholderKOATUU }*/);
                }
            })
            .fail(function (jqXHR, e) {
                showError(ajaxError(jqXHR, e));
            });
    } else {
        $('<option value="' + $area.val() + '">' + $area.text() + '</option>').appendTo($koatuu);
        $koatuu.prop('disabled', false);
        $koatuu.select2();
    }
}

function getFileExtension(filename) {
    return filename.substr((~-filename.lastIndexOf(".") >>> 0) + 2);
}

function getFileSize(size) {
    if (size >= 1000000)
        return (size / 1048576).toFixed(2) + ' Мб';
    else if (size >= 1000)
        return (size / 1024).toFixed(2) + ' Кб';
    else
        return size + ' Б';
}