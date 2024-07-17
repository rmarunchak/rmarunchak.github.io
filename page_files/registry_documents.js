let $form
let debug = false

let df38 = {
    'Серія свідоцтва про визнання': 'documentSeries',
    'Номер свідоцтва про визнання': 'documentNumber',
    'Дата видачі свідоцтва про визнання': 'documentDateGet',
    'ПІБ': 'fio',
    'ПІБ мовою оригіналу': 'fioEn',
    'Заклад освіти/установа, якою видано документ про освіту': 'universityName',
    'Назва документа про освіту': 'origDocumentName',
    'Серія документа про освіту': 'origDocumentSeries',
    'Номер документа про освіту': 'origDocumentNumber',
    'Дата видачі іноземного документа про освіту': 'origDocumentDateGet',
    'Освітній рівень за рішенням про визнання': 'educationLevel',
    'Ступінь освіти за рішенням про визнання': 'degree',
    'Профіль за рішенням про визнання': 'profile',
    'Галузь за рішенням про визнання': 'industry',
    'Напрям за рішенням про визнання': 'direction',
    'Спеціальність за рішенням про визнання': 'specName',
    'Спеціалізація за рішенням про визнання': 'specializationName',
    'Кваліфікація за рішенням про визнання': 'qualName',
    'Період навчання': 'trainingPeriod',
    'Країна навчання': 'countryName',
    'Назва компетентного органу з визнання': 'certificateIssuedName',
    'Права в Україні': 'rights',
}

$(function () {
    $form = $('.document');

    $.fn.select2.defaults.set('minimumResultsForSearch', -1);

    let $dt = $('#documentType', $form);

    $dt.select2();
    $('#educationType', $form).change(function () {
        let t = $(this).val();
        /*if (t == 1) $('.vipRequest').show();
        else $('.vipRequest').hide();*/

        $dt.select2('destroy');
        $('option[value!=""]', $dt).remove();
        $.each(edt, function (i, r) {
            if (r.type == t) {
                let x = ""
                if ([2, 7, 24].indexOf(r.id) != -1) x = " (до 2019)"
                if ([50, 51, 52].indexOf(r.id) != -1) x = " (з 2019)"
                $('<option value="' + r.id + '">' + r.title + x + '</option>').appendTo($dt);
            }
        });
        $dt.select2({ placeholder: 'Оберіть тип документа' });

    $('#documentType', $form).change (function () {
        let dt = $(this).val();
        if (dt == 0) {
            $('#ScdRequest').show();
            $('#EduRequest').hide();
            $('.vipRequest').hide();
        }
        else {
            $('#ScdRequest').hide();
            $('#EduRequest').show();
            $('.vipRequest').show();
        }
    });

    }).change().select2();

    $('#select2-documentType-container').attr('title', 'Оберіть тип документа');

    $('#cbx-vip').change(function () {
        $('#vipRequestEmail').css('display', $(this).is(':checked') ? 'block' : 'none');
    });

    $('#birthDay').datepicker({

        showOn: "focus",
        showAnim: "slide",
        dateFormat: "dd.mm.yy",
        changeMonth: true,
        minDate: new Date('01.01.1930'),
        //yearRange: '-90:-8',

    });

    jQuery($('#birthDay')).inputmask('dd.mm.yyyy', {'placeholder' : 'дд.мм.рррр'});

    loadEUSignLibraries();
});

function requestStart($btn) {
    //$('button', $form).prop('disabled', true);
    let $parent = $btn ? $btn.closest('.buttons-panel') : $parent = $('.buttons-panel', $form)
    $('<div class="ajax-message">Запит обробляється ..</div>').insertBefore($parent);
    $('.ajax-message').show();
}

function requestStop() {
    //$('button', $form).prop('disabled', false);
    $('.ajax-message').remove();
}

let doc_groups = {
    1: { types: [11, 13, 34, 58, 68], title: 'вищу', grade: 'Ступінь вищої освіти' },
    2: { types: [10, 12], title: 'вищу', grade: 'Ступінь вищої освіти (освітньо-кваліфікаційний рівень)' },
    3: { types: [8, 9], title: 'професійну (професійно-технічну)', grade: 'Освітньо-кваліфікаційний рівень' },
    4: { types: [2, 7, 50, 51, 52], title: 'загальну середню', grade: 'Рівень повної загальної середньої освіти' },
    5: { types: [59], title: 'фахову передвищу', grade: 'Ступінь фахової передвищої освіти' },
    9: { types: [16, 21, 26, 27], title: 'студентські' }
}

function getDocGroup(document_type_id) {
    for (let k in doc_groups)
        if ($.inArray(document_type_id, doc_groups[ k ].types) != -1)
            return k
}

function checkDoc($btn) {
    if (checkInputValues([
        { elem: $('#lastName', $form) },
        { elem: $('#firstName', $form) },
        { elem: $('#middleName', $form), empty: true },
        { elem: $('#documentType', $form), optional: true, empty: ($('#educationType', $form).val() == 5 || $('#educationType', $form).val() == 6) },
        { elem: $('#documentSeries', $form), empty: $('#educationType', $form).val() == 5 },
        { elem: $('#documentNumber', $form) },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        if ($('#skipMiddleName', $form).is(':checked')) $('#middleName', $form).val('');

        let data = new Object();
        let fields = ['lastName', 'firstName', 'middleName', 'documentType', 'documentSeries', 'documentNumber', 'birthDay'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());
        data['documentType'] = $('#educationType', $form).val() == 5 ? 38 : $('#educationType', $form).val() == 6 ? 69 : data['documentType'];
        data[ 'skipMiddleName' ] = $('#skipMiddleName', $form).is(':checked') ? 1 : 0;
        //data['birthDay'] = str2date($('#birthDay', $form).val());
        let [d, m, y] = data['birthDay'].split('.');
        data['birthDay'] = (new Date(y, m - 1, d)).toDateString();
        //console.log(data['birthDay']);

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_document', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop()
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Дані не знайдено');
                    else {
                        // Обробка XML

                        d = JSON.parse(decode(ed.Data));
                        let info = '<div id="document-info">', w = 0, buttons = [];
                        let doc_group_id = getDocGroup(d.personDocumentTypeId);
                        // let conditions = ['бакалавр', 'спеціаліст', 'магіст']; //костиль для приховування свідоцтв про визнання всіх крім ВО

                        if (!d.documentStatus || !d.personDocumentTypeId || !d.fio || d.documentStatusCancelled ) {
                            w = 500;
                            info += '<div style="text-align: center" class="error">Документ не знайдено</div>';
                        }
                         /* else if (d.personDocumentTypeId == 38 && ((['Довідка', 'довідка'].some(el => d.origDocumentName.includes(el))) //костиль для приховування свідоцтв про визнання всіх крім ВО
                          || !((conditions.some(el => d.degree.includes(el))) || (conditions.some(el => d.educationLevel.includes(el)))))) {
                            w = 500;
                            info += '<div style="text-align: center" class="error">Свідоцтво про визнання іноземного документа про вищу освіту не знайдено</div>';
                        } */
                        else if (d.documentStatusCancelled) {
                            // анульовані
                            w = 600;
                            info += '<table id="stud-bilet-info">';
                            info += '<tr>' +
                                '<td colspan="2" style="text-align: center">' + d.personDocumentTypeName +
                                '<br/><b>' + d.documentSeries + ' ' + d.documentNumber + '</b></td>' +
                                '</tr>';
                            info += '<tr><td colspan="2" style="text-align: center"><b class="doc-cancel" style="text-transform: uppercase">' + d.documentStatusCancelled + '</b></td></tr>';
                            if (d.cancelDate)
                                info += '<tr><td>Дата ануляції:</td><td>' + d.cancelDate + '</td></tr>';
                            if (d.cancelUniversityName)
                                info += '<tr><td>Заклад освіти, що анулював документ:</td><td>' + d.cancelUniversityName + '</td></tr>';
                            info += '</table>';
                        } else if (doc_group_id == 9) {
                            // студентські
                            w = 600;
                            info += '<table id="stud-bilet-info">';
                            info += '<tr>' +
                                '<td colspan="2" style="text-align: center">' + d.personDocumentTypeName +
                                '<br/><b>' + d.documentSeries + ' ' + d.documentNumber + '</b></td>' +
                                '</tr>';
                            info += '<tr><td>Статус документа: </td><td>' +
                                (d.documentStatusCancelled ?
                                    '<b class="doc-cancel">' + d.documentStatusCancelled + '</b>' :
                                    '<b class="doc-active">' + d.documentStatusActive + '</b>') +
                                '</td></tr>';
                            if (!d.documentStatusCancelled && (d.documentDateGet !== '')) {
                                info += '<tr><td>Термін дії: </td><td><b class="doc-term">' + d.documentDateGet;
                                if (d.documentExpiredDate) info += ' &ndash; ' + d.documentExpiredDate;
                                info += '</b></td></tr>';
                            }
                            if (d.universityName)
                                info += '<tr><td>Заклад освіти: </td><td><b>' + d.universityName + '</b></td></tr>';
                            info += '</table>';
                        } else if (d.personDocumentTypeId == 38) {
                            w = 800;

                            info += '<div id="diplom-header">Інформація<br/>з Реєстру документів про освіту<br/>Єдиної державної електронної бази з питань освіти<br/>щодо свідоцтва про визнання іноземного документа про освіту</div>';
                            info += '<table id="diplom-info">';
                            //d.origDocumentDateGet = str2date(d.origDocumentDateGet);
                            for (let name in df38) {
                                if (d[ df38[ name ] ]) {
                                    info += '<tr><td width="300">' + name + '</td>';
                                    info += '<td>' + d[ df38[ name ] ] + '</td>';
                                    info += '</tr>';
                                }
                            }
                            info += '</table>';
                        } else if (d.personDocumentTypeId == 69) {
                            w = 800;

                            info += '<div id="diplom-header">Інформація<br/>з Реєстру документів про освіту<br/>Єдиної державної електронної бази з питань освіти<br/>щодо свідоцтва про визнання документа про духовну освіту</div>';
                            info += '<table id="diplom-info">';
                            //d.origDocumentDateGet = str2date(d.origDocumentDateGet);
                            for (let name in df38) {
                                if (d[ df38[ name ] ]) {
                                    info += '<tr><td width="300">' + name + '</td>';
                                    info += '<td>' + d[ df38[ name ] ] + '</td>';
                                    info += '</tr>';
                                }
                            }
                            info += '</table>';
                        } else {
                            w = 800;

                            let is_high = (doc_group_id == 1 || doc_group_id == 2);
                            info += '<div id="diplom-header">Інформація<br/>з Реєстру документів про освіту<br/>Єдиної державної електронної бази з питань освіти<br/>щодо документа про ' + doc_groups[ doc_group_id ].title + ' освіту</div>';
                            info += '<table id="diplom-info">';

                            info += '<tr><td width="200">Найменування документа</td>';
                            if (d.awardName != '') d.personDocumentTypeName += ' (' + d.awardName.toLowerCase() + ')';
                            if (d.duplicateText) {
                                d.personDocumentTypeName += ' (<span style="color: red">дублікат</span>)';
                                if (d.personDocumentTypeEn) d.personDocumentTypeEn += ' (<span style="color: red">duplicate</span>)';
                            }
                            if (is_high && d.personDocumentTypeEn)
                                info += '<td width="300">' + d.personDocumentTypeName + '</td><td width="300">' + d.personDocumentTypeEn + '</td>';
                            else
                                info += '<td colspan="2">' + d.personDocumentTypeName + '</td>';
                            info += '</tr>';


                            info += '<tr>' +
                                '<td width="200">Реєстраційний номер документа в Єдиній державній електронній базі з питань освіти</td>' +
                                '<td colspan="2" width="600">' + d.documentSeries + ' ' + d.documentNumber + '</td>' +
                                '</tr>';


                            if(d.supplementId) {
                                info += '<tr>' +
                                    '<td width="200">Реєстраційний номер додатка до документа в Єдиній державній електронній базі з питань освіти</td>' +
                                    '<td colspan="2" width="600">' + d.supplementId + '</td>' +
                                    '</tr>';
                            }

                            info += '<tr>' +
                                '<td width="200">Дата видачі документа</td>' +
                                '<td colspan="2" width="600">' + d.documentDateGet + '</td>' +
                                '</tr>';

                            if (d.dateEndEducation || d.documentDateGet)
                                info += '<tr>' +
                                    '<td width="200">Рік закінчення закладу освіти (відокремленого структурного підрозділу) (здобуття освіти)</td>' +
                                    '<td colspan="2">' + (d.dateEndEducation ? d.dateEndEducation : d.documentDateGet).substring(6) + '</td>' +
                                    '</tr>';

                            info += '<tr><td width="200">Прізвище, ім\'я, по батькові власника документа</td>';
                            if (is_high && d.fioEn)
                                info += '<td width="300">' + d.fio + '</td><td width="300">' + d.fioEn + '</td>';
                            else
                                info += '<td colspan="2">' + d.fio + '</td>';
                            info += '</tr>';
/*
                            info += '<tr><td width="200">Дата народження</td>';
                            if ($('#birthDay').val())
                                info += '<td colspan="2">' + d.birthday + '</td>';
                            else
                                info += '<td width="300">Не вказано у запиті</td><td width="300">Not specified in the request</td>';
                            info += '</tr>';
*/
                            info += '<tr>' +
                                '<td width="200">Найменування закладу освіти (відокремленого структурного підрозділу), що закінчив (в якому здобув відповідну освіту) власник документа</td>';
                            if (is_high && d.universityNameEn)
                                info += '<td width="300">' + d.universityName + '</td><td width="300">' + d.universityNameEn + '</td>';
                            else
                                info += '<td colspan="2">' + d.universityName + '</td>';
                            info += '</tr>';

                            if(d.scientificCouncilUniversityName) {
                                info += '<tr>' + '<td width="200">Назва ЗВО (НУ), в спеціалізованій вченій раді якого (якої) здійснювався захист дисертації</td>'
                                info += '<td width="300">' + d.scientificCouncilUniversityName + '</td><td width="300">' + d.scientificCouncilUniversityNameEn + '</td>';
                                info += '</tr>';
                            }

                            if (d.beginningUniversityName) {
                                info += '<tr>' +
                                    '<td width="200">Рік вступу, найменування ЗВО, до якого іноземець або особа без громадянства вступили на початку навчання в Україні</td>';
                                if (d.beginningUniversityNameEn)
                                    info +=
                                        '<td width="300">' + d.beginningUniversityYear + ',' + d.beginningUniversityName + '</td>' +
                                        '<td width="300">' + d.beginningUniversityYear + ',' + d.beginningUniversityNameEn + '</td>';
                                else
                                    info += '<td colspan="2">' + d.beginningUniversityYear + ',' + d.beginningUniversityName + '</td>';
                                info += '</tr>';
                            }

                            if (is_high) {
                                if (d.specName || d.qualName) {
                                    info += '<tr>' +
                                        '<td width="200">Кваліфікація власника документа (здобутий ступінь вищої освіти, спеціальність та, за наявності, -  спеціалізація, освітня програма, професійна кваліфікація)</td>';

                                    info += '<td ' + (d.specNameEn ? 'width="300"' : 'colspan="2"') + '>' +
                                        'Здобув(ла) кваліфікацію:' +
                                        '<br/>' + doc_groups[ doc_group_id ].grade + ': ' + d.QualificationName +
                                        '<br/>Спеціальність: ' + d.specName + (d.specializationName ? ' (' + d.specializationName + ')' : '') +
                                        (d.studyProgramName ? '<br/>Освітня програма: ' + d.studyProgramName : '') +
                                        (d.qualName ? '<br/>Професійна кваліфікація: ' + d.qualName : '') +
                                        '</td>';

                                    if (d.specNameEn)
                                        info += '<td width="300">' +
                                            'Obtained qualification: ' + d.QualificationNameEn +
                                            '<br/>Speciality: ' + d.specNameEn + (d.specializationNameEn ? ' (' + d.specializationNameEn + ')' : '') +
                                            (d.studyProgramNameEn ? '<br/>Educational program: ' + d.studyProgramNameEn : '') +
                                            (d.qualNameEn ? '<br/>Professional qualification: ' + d.qualNameEn : '') +
                                            '</td>';

                                }
                            } else if (d.professionText || d.qualName) {
                                info += '<tr><td width="200">Здобута професія (за наявності – з інформацією про  категорію, розряд, клас, групу, рівень)</td>';
                                info += '<td colspan="2">' + (d.professionText ? d.professionText : d.qualName) + '</td>';
                                info += '</tr>';
                            }

                            if (d.duplicateUniversityName) {
                                info += '<tr>' +
                                    '<td width="200">Найменування закладу освіти, що видав документ</td>' +
                                    '<td colspan="2">' + d.duplicateUniversityName + '</td>' +
                                    '</tr>';
                            }

                            if (d.bossFio) {
                                info += '<tr>' +
                                    '<td width="200">Найменування посади, ініціали та прізвище керівника або іншої уповноваженої особи закладу освіти - підписанта документа</td>';
                                if (is_high && d.bossFioEn)
                                    info +=
                                        '<td width="300">' + d.bossPostName + '<br/>' + d.bossFio + '</td>' +
                                        '<td width="300">' + d.bossPostNameEn + '<br/>' + d.bossFioEn + '</td>';
                                else
                                    info += '<td colspan="2">' + d.bossPostName + '<br/>' + d.bossFio + '</td>';
                                info += '</tr>';
                            }

                            info += '</table>';

                            /*if (ed.File) {
                                let fileData = decodeFile(ed.File);
                                buttons.push({
                                    text: 'Виписка',
                                    width: 150,
                                    click: function () {
                                        let blob = new Blob([ fileData ], { type: "application/pdf" });
                                        saveAs(blob, 'Виписка ' + d.documentSeries + ' ' + d.documentNumber + '.pdf');
                                    }
                                });
                            }*/

                        }
                        info += '</div>';

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
    //refreshCaptcha($('#Captcha', $form), $('#imgCaptcha', $form));
}

function checkNavy($btn) {
    if (checkInputValues([
        { elem: $('#lastName', $form) },
        { elem: $('#firstName', $form) },
        { elem: $('#middleName', $form) },
        { elem: $('#documentType', $form), optional: true, empty: ($('#educationType', $form).val() == 5 || $('#educationType', $form).val() == 6) },
        { elem: $('#documentSeries', $form), empty: $('#educationType', $form).val() == 5 },
        { elem: $('#documentNumber', $form) },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        if ($('#skipMiddleName', $form).is(':checked')) $('#middleName', $form).val('');

        let data = new Object();
        let fields = ['lastName', 'firstName', 'middleName', 'documentType', 'documentSeries', 'documentNumber', 'birthDay'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());
        let [d, m, y] = data['birthDay'].split('.');
        data['birthDay'] = (new Date(y, m - 1, d)).toDateString();

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_navy', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop()
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Дані не знайдено');
                    else {
                        // Обробка XML

                        d = JSON.parse(decode(ed.Data));
                        let info = '<div id="document-info">', w = 0, buttons = [];
                        let doc_group_id = getDocGroup(d.personDocumentTypeId);

                        if (!d.documentStatus || !d.personDocumentTypeId || !d.fio || !d.documentStatusCancelled ) {
                            w = 500;
                            info += '<div style="text-align: center" class="error">Документ не знайдено</div>';
                        }
                        else if (d.documentStatusCancelled) {
                            // анульовані
                            w = 600;
                            info += '<table id="stud-bilet-info">';
                            info += '<tr>' +
                                '<td colspan="2" style="text-align: center">' + d.personDocumentTypeName +
                                '<br/><b>' + d.documentSeries + ' ' + d.documentNumber + '</b></td>' +
                                '</tr>';
                            info += '<tr><td colspan="2" style="text-align: center"><b class="doc-cancel" style="text-transform: uppercase">' + d.documentStatusCancelled + '</b></td></tr>';
                            if (d.cancelDate)
                                info += '<tr><td>Дата ануляції:</td><td>' + d.cancelDate + '</td></tr>';
                            if (d.cancelUniversityName)
                                info += '<tr><td>Заклад освіти, що анулював документ:</td><td>' + d.cancelUniversityName + '</td></tr>';
                            info += '</table>';
                        } else {
                            w = 800;

                            let is_high = (doc_group_id == 1 || doc_group_id == 2);
                            info += '<div id="diplom-header">Інформація<br/>щодо документа про ' + doc_groups[ doc_group_id ].title + ' освіту</div>';
                            info += '<table id="diplom-info">';

                            info += '<tr><td width="200">Найменування документа</td>';
                            if (d.awardName != '') d.personDocumentTypeName += ' (' + d.awardName.toLowerCase() + ')';
                            if (d.duplicateText) {
                                d.personDocumentTypeName += ' (<span style="color: red">дублікат</span>)';
                                if (d.personDocumentTypeEn) d.personDocumentTypeEn += ' (<span style="color: red">duplicate</span>)';
                            }
                            if (is_high && d.personDocumentTypeEn)
                                info += '<td width="300">' + d.personDocumentTypeName + '</td><td width="300">' + d.personDocumentTypeEn + '</td>';
                            else
                                info += '<td colspan="2">' + d.personDocumentTypeName + '</td>';
                            info += '</tr>';


                            info += '<tr>' +
                                '<td width="200">Реєстраційний номер документа в Єдиній державній електронній базі з питань освіти</td>' +
                                '<td colspan="2" width="600">' + d.documentSeries + ' ' + d.documentNumber + '</td>' +
                                '</tr>';


                            if(d.supplementId) {
                                info += '<tr>' +
                                    '<td width="200">Реєстраційний номер додатка до документа в Єдиній державній електронній базі з питань освіти</td>' +
                                    '<td colspan="2" width="600">' + d.supplementId + '</td>' +
                                    '</tr>';
                            }

                            info += '<tr>' +
                                '<td width="200">Дата видачі документа</td>' +
                                '<td colspan="2" width="600">' + d.documentDateGet + '</td>' +
                                '</tr>';

                            if (d.dateEndEducation || d.documentDateGet)
                                info += '<tr>' +
                                    '<td width="200">Рік закінчення закладу освіти (відокремленого структурного підрозділу) (здобуття освіти)</td>' +
                                    '<td colspan="2">' + (d.dateEndEducation ? d.dateEndEducation : d.documentDateGet).substring(6) + '</td>' +
                                    '</tr>';

                            info += '<tr><td width="200">Прізвище, ім\'я, по батькові власника документа</td>';
                            if (is_high && d.fioEn)
                                info += '<td width="300">' + d.fio + '</td><td width="300">' + d.fioEn + '</td>';
                            else
                                info += '<td colspan="2">' + d.fio + '</td>';
                            info += '</tr>';
/*
                            info += '<tr><td width="200">Дата народження</td>';
                            if ($('#birthDay').val())
                                info += '<td colspan="2">' + d.birthday + '</td>';
                            else
                                info += '<td width="300">Не вказано у запиті</td><td width="300">Not specified in the request</td>';
                            info += '</tr>';
*/
                            info += '<tr>' +
                                '<td width="200">Найменування закладу освіти (відокремленого структурного підрозділу), що закінчив (в якому здобув відповідну освіту) власник документа</td>';
                            if (is_high && d.universityNameEn)
                                info += '<td width="300">' + d.universityName + '</td><td width="300">' + d.universityNameEn + '</td>';
                            else
                                info += '<td colspan="2">' + d.universityName + '</td>';
                            info += '</tr>';

                            if(d.scientificCouncilUniversityName) {
                                info += '<tr>' + '<td width="200">Назва ЗВО (НУ), в спеціалізованій вченій раді якого (якої) здійснювався захист дисертації</td>'
                                info += '<td width="300">' + d.scientificCouncilUniversityName + '</td><td width="300">' + d.scientificCouncilUniversityNameEn + '</td>';
                                info += '</tr>';
                            }

                            if (d.beginningUniversityName) {
                                info += '<tr>' +
                                    '<td width="200">Рік вступу, найменування ЗВО, до якого іноземець або особа без громадянства вступили на початку навчання в Україні</td>';
                                if (d.beginningUniversityNameEn)
                                    info +=
                                        '<td width="300">' + d.beginningUniversityYear + ',' + d.beginningUniversityName + '</td>' +
                                        '<td width="300">' + d.beginningUniversityYear + ',' + d.beginningUniversityNameEn + '</td>';
                                else
                                    info += '<td colspan="2">' + d.beginningUniversityYear + ',' + d.beginningUniversityName + '</td>';
                                info += '</tr>';
                            }

                            if (is_high) {
                                if (d.specName || d.qualName) {
                                    info += '<tr>' +
                                        '<td width="200">Кваліфікація власника документа (здобутий ступінь вищої освіти, спеціальність та, за наявності, -  спеціалізація, освітня програма, професійна кваліфікація)</td>';

                                    info += '<td ' + (d.specNameEn ? 'width="300"' : 'colspan="2"') + '>' +
                                        'Здобув(ла) кваліфікацію:' +
                                        '<br/>' + doc_groups[ doc_group_id ].grade + ': ' + d.QualificationName +
                                        '<br/>Спеціальність: ' + d.specName + (d.specializationName ? ' (' + d.specializationName + ')' : '') +
                                        (d.studyProgramName ? '<br/>Освітня програма: ' + d.studyProgramName : '') +
                                        (d.qualName ? '<br/>Професійна кваліфікація: ' + d.qualName : '') +
                                        '</td>';

                                    if (d.specNameEn)
                                        info += '<td width="300">' +
                                            'Obtained qualification: ' + d.QualificationNameEn +
                                            '<br/>Speciality: ' + d.specNameEn + (d.specializationNameEn ? ' (' + d.specializationNameEn + ')' : '') +
                                            (d.studyProgramNameEn ? '<br/>Educational program: ' + d.studyProgramNameEn : '') +
                                            (d.qualNameEn ? '<br/>Professional qualification: ' + d.qualNameEn : '') +
                                            '</td>';

                                }
                            } else if (d.professionText || d.qualName) {
                                info += '<tr><td width="200">Здобута професія (за наявності – з інформацією про  категорію, розряд, клас, групу, рівень)</td>';
                                info += '<td colspan="2">' + (d.professionText ? d.professionText : d.qualName) + '</td>';
                                info += '</tr>';
                            }

                            if (d.duplicateUniversityName) {
                                info += '<tr>' +
                                    '<td width="200">Найменування закладу освіти, що видав документ</td>' +
                                    '<td colspan="2">' + d.duplicateUniversityName + '</td>' +
                                    '</tr>';
                            }

                            if (d.bossFio) {
                                info += '<tr>' +
                                    '<td width="200">Найменування посади, ініціали та прізвище керівника або іншої уповноваженої особи закладу освіти - підписанта документа</td>';
                                if (is_high && d.bossFioEn)
                                    info +=
                                        '<td width="300">' + d.bossPostName + '<br/>' + d.bossFio + '</td>' +
                                        '<td width="300">' + d.bossPostNameEn + '<br/>' + d.bossFioEn + '</td>';
                                else
                                    info += '<td colspan="2">' + d.bossPostName + '<br/>' + d.bossFio + '</td>';
                                info += '</tr>';
                            }

                            info += '</table>';

                        }
                        info += '</div>';

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
    //refreshCaptcha($('#Captcha', $form), $('#imgCaptcha', $form));
}

function checkEdu($btn) {
    if (checkInputValues([
        //{ elem: $('#lastName', $form) },
        //{ elem: $('#firstName', $form) },
        //{ elem: $('#middleName', $form), empty: true },
        { elem: $('#studyProofId', $form) },
        { elem: $('#rnokpp', $form) },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        //if ($('#skipMiddleName', $form).is(':checked')) $('#middleName', $form).val('');

        let data = new Object();
        let fields = ['studyProofId', 'rnokpp'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_study', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop()
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Дані не знайдено');
                    else {
                        // Обробка XML

                        d = JSON.parse(decode(ed.Data));
                        let info = '<div id="document-info">', w = 0, buttons = [];
                        if (!d.lastName) {
                            w = 500;
                            info += '<div style="text-align: center" class="error">Документ не знайдено</div>';
                        } else {
                            w = 1000;

                            info += '<div id="diplom-header"><b>ДОВІДКА</b><br /> про здобувача освіти за даними Єдиної державної<br />електронної бази з питань освіти</div>';
                            info += '<table id="diplom-info">';
                            info += '</tr>';


                            if (d.lastName) {
                                info += '<tr>' +
                                    '<td width="200">Прізвище</td>' +
                                    '<td colspan="2">' + d.lastName + '</td>' +
                                    '</tr>';
                            }

                            if (d.firstName) {
                                info += '<tr>' +
                                    '<td width="200">Ім`я</td>' +
                                    '<td colspan="2">' + d.firstName + '</td>' +
                                    '</tr>';
                            }

                            if (d.middleName) {
                                info += '<tr>' +
                                    '<td width="200">По батькові (за наявності)</td>' +
                                    '<td colspan="2">' + d.middleName + '</td>' +
                                    '</tr>';
                            }

                            if (d.birthday) {
                                info += '<tr>' +
                                    '<td width="200">Дата народження</td>' +
                                    '<td colspan="2">' + str2date((d.birthday).substr(0, 10)) + '</td>' +
                                    '</tr>';
                            }

                            if (d.personSexName) {
                                info += '<tr>' +
                                    '<td width="200">Стать</td>' +
                                    '<td colspan="2">' + d.personSexName + '</td>' +
                                    '</tr>';
                            }

                            if (d.rnokpp) {
                                info += '<tr>' +
                                    '<td width="200">Реєстраційний номер облікової картки платника податків</td>' +
                                    '<td colspan="2">' + d.rnokpp + '</td>' +
                                    '</tr>';
                            }


                            if (d.universityName) {
                                info += '<tr>' +
                                    '<td width="200">Назва закладу освіти</td>' +
                                    '<td colspan="2">' + d.universityName + '</td>' +
                                    '</tr>';
                            }


                            if (d.qualificationGroupName) {
                                info += '<tr>' +
                                    '<td width="200">Ступінь/Рівень освіти</td>' +
                                    '<td colspan="2">' + d.qualificationGroupName + '</td>' +
                                    '</tr>';
                            }


                            if (d.educationFormName) {
                                info += '<tr>' +
                                    '<td width="200">Форма здобуття освіти</td>' +
                                    '<td colspan="2">' + d.educationFormName + '</td>' +
                                    '</tr>';
                            }


                            if (d.specialityName) {
                                info += '<tr>' +
                                    '<td width="200">Код та назва спеціальності/професії</td>' +
                                    '<td colspan="2">' + d.specialityName + '</td>' +
                                    '</tr>';
                            }


                            if (d.educationDateBegin) {
                                info += '<tr>' +
                                    '<td width="200">Дата початку здобуття освіти</td>' +
                                    '<td colspan="2">' + str2date(d.educationDateBegin) + '</td>' +
                                    '</tr>';
                            }


                            if (d.educationDateEnd) {
                                info += '<tr>' +
                                    '<td width="200">Дата завершення здобуття освіти</td>' +
                                    '<td colspan="2">' + str2date(d.educationDateEnd) + '</td>' +
                                    '</tr>';
                            }


                            if (d.orderNumber) {
                                info += '<tr>' +
                                    '<td width="200">Номер наказу про зарахування (поновлення, переведення)</td>' +
                                    '<td colspan="2">' + d.orderNumber + '</td>' +
                                    '</tr>';
                            }


                            if (d.orderDate) {
                                info += '<tr>' +
                                    '<td width="200">Дата наказу про зарахування (поновлення, переведення)</td>' +
                                    '<td colspan="2">' + str2date(d.orderDate) + '</td>' +
                                    '</tr>';
                            }

                                info += '<tr>' +
                                    '<td width="500"><b>На підставі даних, що містяться в Єдиній державній електронній базі з питань освіти, поточне здобуття освіти не порушує послідовності, визначеної частиною другою статті 10 Закону України "Про освіту"</b></td>' +
                                    '<td colspan="2">' + (d.isSequential ? "<b style=\"color: green;\">Так, не порушує</b>" : "<b style=\"color: red;\">Ні, порушує</b>") + '</td>' +
                                    '</tr>';

                            if (d.certificateSerial) {
                                info += '<tr>' +
                                    '<td width="200">Номер сертифікату КЕП особи, що підписала довідку</td>' +
                                    '<td colspan="2">' + d.certificateSerial + '</td>' +
                                    '</tr>';
                            }

                            if (d.certificateDateFrom && d.certificateDateTo) {
                                info += '<tr>' +
                                    '<td width="200">Сертифікат, діє </td>' +
                                    '<td colspan="2"> з ' + str2date(d.certificateDateFrom) + ' по ' + str2date(d.certificateDateTo) + '</td>' +
                                    '</tr>';
                            }

                            if (d.signerPosition) {
                                info += '<tr>' +
                                    '<td width="200">Посада особи, що підписала довідку</td>' +
                                    '<td colspan="2">' + d.signerPosition + '</td>' +
                                    '</tr>';
                            }

                            if (d.signerUser) {
                                info += '<tr>' +
                                    '<td width="200">ПІБ особи, що підписала довідку</td>' +
                                    '<td colspan="2">' + d.signerUser + '</td>' +
                                    '</tr>';
                            }


                            info += '</table>';

                        }
                        info += '</div>';

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
    //refreshCaptcha($('#Captcha', $form), $('#imgCaptcha', $form));
}

function sendVIPRequest($btn) {
    if (checkInputValues([
        { elem: $('#lastName', $form) },
        { elem: $('#firstName', $form) },
        { elem: $('#middleName', $form), empty: true },
        { elem: $('#documentType', $form), optional: true, empty: ($('#educationType', $form).val() == 5 || $('#educationType', $form).val() == 6) },
        { elem: $('#documentSeries', $form), empty: $('#educationType', $form).val() == 5 },
        { elem: $('#documentNumber', $form) },
        { elem: $('#captcha', $form), reqlen: true },
        { elem: $('#vipRequestEmail', $form), email: true }
    ])) {
        let data = new Object();
        let fields = ['lastName', 'firstName', 'middleName', 'documentType', 'documentSeries', 'documentNumber', 'birthDay'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());
        data[ 'skipMiddleName' ] = $('#skipMiddleName', $form).is(':checked') ? 1 : 0;
        // data['birthDay'] = str2date($('#birthDay', $form).val());
        let [d, m, y] = data['birthDay'].split('.');
        data['birthDay'] = (new Date(y, m - 1, d)).toDateString();
        data['documentType'] = $('#educationType', $form).val() == 5 ? 38 : $('#educationType', $form).val() == 6 ? 69 : data['documentType'];
        data[ 'Email' ] = $('#vipRequestEmail', $form).val();

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'send_request', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop();
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.OK)
                        showError('Помилка обробки даних');
                    else {
                        showMessage('Запит відправлено');
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
}

function checkPedagogCert($btn) {
    if (checkInputValues([
        { elem: $('#CertYear', $form) },
        { elem: $('#Number', $form) },
        { elem: $('#LastName', $form) },
        { elem: $('#FirstName', $form) },
        { elem: $('#MiddleName', $form) },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        let data = new Object();
        let fields = ['CertYear', 'Number', 'LastName', 'FirstName', 'MiddleName'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_document', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop();
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Помилка даних');
                    else {
                        // Обробка XML
                        d = JSON.parse(decode(ed.Data));
                        let info = '<div id="document-info">', w = 600, buttons = [];
                        info += '<div id="diplom-header">Інформація<br/>з Реєстру сертифікатів педагогічних працівників<br/>Єдиної державної електронної бази з питань освіти</div>';
                        info += '<table id="diplom-info">';
                        info += '<tr><td width="220">Рік</td><td width="400">' + d.year + '</td></tr>';
                        info += '<tr><td>Номер</td><td>' + d.number + '</td></tr>';
                        info += '<tr><td>Прізвище, ім\'я, по батькові</td><td>' + [d.lastName, d.firstName, d.middleName].join(' ') + '</td></tr>';
                        info += '<tr><td>Посада</td><td>' + d.pedagogPostName + '</td></tr>';
                        info += '<tr><td>Дата видачі</td><td>' + str2date(d.issueDate) + '</td></tr>';
                        info += '<tr><td>Дата закінчення дії</td><td>' + str2date(d.endDate) + '</td></tr>';
                        info += '<tr><td colspan="2">Протокол від ' + str2date(d.protocolDate) + ' № ' + d.protocolNumber + '</td></tr>';
                        info += '</tr>';
                        info += '</table>';
                        info += '</div>';

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
    //refreshCaptcha($('#Captcha', $form), $('#imgCaptcha', $form));
}

function checkZNOCert($btn) {
    if (checkInputValues([
        { elem: $('#CertYear', $form) },
        { elem: $('#Number', $form) },
        { elem: $('#LastName', $form) },
        { elem: $('#FirstName', $form) },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        let data = new Object();
        let fields = ['CertYear', 'Number', 'LastName', 'FirstName', 'MiddleName'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_document', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop();
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Помилка даних');
                    else {
                        // Обробка XML
                        d = JSON.parse(decode(ed.Data));
                        let info = '<div id="document-info">', w = 600, buttons = [];
                        info += '<div id="diplom-header">Інформація<br/>з Реєстру сертифікатів<br/>зовнішнього незажного оцінювання<br/>Єдиної державної електронної бази з питань освіти</div>';
                        info += '<table id="diplom-info">';
                        info += '<tr><td width="270">Рік проходження</td><td width="330">' + d.certYear + '</td></tr>';
                        info += '<tr><td>Номер сертифікату</td><td>' + d.number + '</td></tr>';
                        info += '<tr><td>Прізвище, ім\'я, по батькові</td><td>' + [d.lastName, d.firstName, d.middleName].join(' ') + '</td></tr>';
                        info += '<tr><td colspan="2" align="center"><b>Результати</b></td></tr>';
                        for (let i = 0; i <= 6; i++) {
                            if (d[ 'subjectName' + i ])
                                info += '<tr><td>' + d[ 'subjectName' + i ] + '</td><td>' + d[ 'ball' + i ] + '</td></tr>';
                        }

                        info += '</tr>';
                        info += '</table>';
                        info += '</div>';

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
    //refreshCaptcha($('#Captcha', $form), $('#imgCaptcha', $form));
}

function checkNMTCert($btn) {
    if (checkInputValues([
        { elem: $('#CertYear', $form) },
        { elem: $('#Number', $form) },
        { elem: $('#LastName', $form) },
        { elem: $('#FirstName', $form) },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        let data = new Object();
        let fields = ['CertYear', 'Number', 'LastName', 'FirstName', 'MiddleName'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_document', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop();
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Помилка даних');
                    else {
                        // Обробка XML
                        d = JSON.parse(decode(ed.Data));
                        let info = '<div id="document-info">', w = 600, buttons = [];
                        info += '<div id="diplom-header">Інформація, що міститься в<br/>Єдиній державній електронній базі з питань освіти<br /> про сертифікат Національного мультипредметного тесту (НМТ)</div>';
                        info += '<table id="diplom-info">';
                        info += '<tr><td width="270">Рік проходження</td><td width="330">' + d.certYear + '</td></tr>';
                        info += '<tr><td>Номер сертифікату</td><td>' + d.number + '</td></tr>';
                        info += '<tr><td>Прізвище, ім\'я, по батькові</td><td>' + [d.lastName, d.firstName, d.middleName].join(' ') + '</td></tr>';
                        info += '<tr><td colspan="2" align="center"><b>Результати</b></td></tr>';
                        for (let i = 0; i <= 6; i++) {
                            if (d[ 'subjectName' + i ])
                                info += '<tr><td>' + d[ 'subjectName' + i ] + '</td><td>' + d[ 'ball' + i ] + '</td></tr>';
                        }

                        info += '</tr>';
                        info += '</table>';
                        info += '</div>';

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
    //refreshCaptcha($('#Captcha', $form), $('#imgCaptcha', $form));
}

function blockedWarn() {
let info = '<div id="document-info">', w = 600, buttons = [];
info += '<div id="diplom-header">Проводяться технічні роботи</div>';
info += '<p>Функціонал тимчасово недоступний, спробуйте пізніше!</p>';
info += '</div>';
buttons.push({
            text: 'Закрити',
            width: 150,
            click: function () {
            $(this).dialog('close');
              }
            });

$dlg = showMessage(info, 'Результат запиту', w, buttons);
}

function checkAlien($btn) {
    if (checkInputValues([
        { elem: $('#AlienId', $form) },
        { elem: $('#LastName', $form) },
        { elem: $('#FirstName', $form) },
        { elem: $('#MiddleName', $form), empty: true },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        let data = new Object();
        let fields = ['AlienId', 'LastName', 'FirstName', 'MiddleName'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());


        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_document', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop();
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Помилка даних');
                    else {
                        // Обробка XML
                        d = JSON.parse(decode(ed.Data));
                        let info = '<div id="document-info">', w = 600, buttons = [];
                        info += '<div id="diplom-header">Верифікація довідки про навчання іноземця</div>';
                        info += '<table id="diplom-info">';
                        info += '<tr><td>Номер довідки</td><td>' + $('#AlienId', $form).val() + '</td></tr>';
                        info += '<tr><td>Прізвище, ім\'я, по батькові</td><td>' + [$('#LastName', $form).val(), $('#FirstName', $form).val(), $('#MiddleName', $form).val()].join(' ') + '</td></tr>';
                        info += '<tr><td>Статус</td><td>' + (d.status == 1 ? '<span style="color: green">знайдено</span>' : '<span style="color: #cb2156">не знайдено</span>') + '</td></tr>';
                        if (d.answer) info += '<tr><td>Інформація</td><td>' + d.answer + '</td></tr>';
                        info += '</tr>';
                        info += '</table>';
                        info += '</div>';

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
    //refreshCaptcha($('#Captcha', $form), $('#imgCaptcha', $form));
}


function signData(keyFile, keyPwd, $CAs, data, onsuccess) {
    if (!keyFile || !keyPwd) {
        showError('Не вказано ключ або пароль')
        return
    }

    // Зчитування особистого ключа
    euSign.ReadFile(keyFile,
        (file) => {
            let keyData = file.GetData()
            if (debug) console.log('Отримання відкритої інформації про ключ')
            let keyInfo = euSign.GetKeyInfoBinary(keyData, keyPwd);

            let cmpServers = []
            if ($CAs.val()) cmpServers.push($CAs.val())
            else
                $('option', $CAs).each(function () {
                    if ($(this).attr('value')) cmpServers.push($(this).attr('value'))
                })

            if (debug) console.log('Отримання сертифікатів [' + cmpServers.length + ']')
            let certificates = euSign.GetCertificatesByKeyInfo(keyInfo, cmpServers)
            euSign.SaveCertificates(certificates)

            if (debug) console.log('Зчитування особистого ключа')
            euSign.ReadPrivateKeyBinary(keyData, keyPwd)

            let keyOwnerInfo = euSign.GetPrivateKeyOwnerInfo()
            if (debug) {
                console.log('Інформація про ключ', true)

                let props = ['issuerCN', 'serial', 'subjCN', 'subjOrg', 'subjOrgUnit', 'subjTitle', 'subjState', 'subjLocality', 'subjFullName', 'subjAddress', 'subjPhone', 'subjEMail', 'subjEDRPOUCode', 'subjDRFOCode']
                for (let k in props)
                    console.log('- ' + props[ k ] + ' = ' + keyOwnerInfo[ props[ k ] ])
            }

            // Підпис даних
            console.log('data', data)
            let sign = euSign.SignData(data, true)
            if (debug) console.log(sign)
            if (onsuccess) onsuccess(sign)
            return sign
        },
        (e) => {
            requestStop();
            showError(e.message);
        })
}

function checkPhysPerson($btn) {
    if (!euSignWeb) {
        showError('Не вибрано файл ключа підпису')
        return
    }

    if (checkInputValues([
        { elem: $('#LastName', $form) },
        { elem: $('#FirstName', $form) },
        { elem: $('#MiddleName', $form), empty: true },
        //{ elem: $('#KeyPwd', $form) },
    ])) {

        requestStart($btn);
        let xml = data2xml($form, 'Person', ['LastName', 'FirstName', 'MiddleName'])

        function sendPhysPersonData(sign) {
            let p = encode(xml, true);
            $('#qr-code-block').hide();
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_document', 'captcha': $('#captcha').val(), 'p': p, 'sign': sign, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop();
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.file)
                        showError('Дані не знайдено');
                    else if (ed.ext != 'pdf')
                        showError('Невірний формат даних');
                    else {
                        let blob = new Blob([decodeFile(ed.file)], { type: ed.type });
                        saveAs(blob, ed.filename);
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        }


        let xml_array = Uint8Array.from(euSign.StringToArray(xml))
        if (euSignWeb) {
            euSignWeb.SignData(xml_array, true, true, EndUser.SignAlgo.DSTU4145WithGOST34311, null, EndUser.SignType.CAdES_BES).then((sign) => {
                sendPhysPersonData(sign)
            })
        } else {
            let keyFile = $('#KeyFile').get(0).files[ 0 ]
            let keyPwd = $('#KeyPwd').val()

            signData(keyFile, keyPwd, $('#KeyCAs'), xml, (sign) => {
                sendPhysPersonData(sign)
            })
        }

    }
}

function checkScdDoc($btn) {
    if (checkInputValues([
        { elem: $('#lastName', $form) },
        { elem: $('#firstName', $form) },
        { elem: $('#middleName', $form) },
        { elem: $('#documentType', $form), optional: true },
        { elem: $('#documentSeries', $form), empty: $('#documentType', $form).val() == 38 },
        { elem: $('#documentNumber', $form) },
        { elem: $('#captcha', $form), reqlen: true }
    ])) {
        let data = new Object();
        let fields = ['lastName', 'firstName', 'middleName', 'documentType', 'documentSeries', 'documentNumber', 'birthDay'];
        for (let f in fields) data[ fields[ f ] ] = $.trim($('#' + fields[ f ], $form).val());
        data['birthDay'] = str2date($('#birthDay', $form).val());

        requestStart($btn);
        let p = encode(JSON.stringify(data), true);

        if (p) {
            $.ajax({
                method: 'POST', dataType: 'json',
                data: { 'action': 'check_document_scd', 'captcha': $('#captcha').val(), 'p': p, 's': euSignSessionData }
            })
                .done(function (ed) {
                    requestStop();
                    if (ed.error)
                        showError(ed.error);
                    else if (!ed.Data)
                        showError('Помилка даних');
                    else {
                        // Обробка XML
                        d = JSON.parse(decode(ed.Data));
                        console.log(d)
                        let info = '', w = 600, buttons = []
                        if (d.isFound) {
                            info = '<div id="document-info">'
                            info += '<div id="diplom-header">Інформація<br />з Реєстру документів про освіту<br />Єдиної державної електронної бази з питань освіти<br /> щодо документа про початкову освіту</div>';
                            info += '<table id="diplom-info">';
                            info += '<tr><td width="270">Серія і номер документа</td><td width="330">' + d.documentSeries + ' ' + d.documentNumber + '</td></tr>';
                            info += '<tr><td>Дата видачі документа</td><td>' + str2date((d.documentGiveDate).split('+')[0]) + '</td></tr>';
                            info += '<tr><td>Прізвище, ім\'я, по батькові</td><td>' + d.lastName + ' ' + d.firstName + ' ' + d.middleName + '</td></tr>';
                            info += '<tr><td>Дата народження</td><td>' + str2date((d.birthday).split('+')[0]) + '</td></tr>';
                            info += '<tr><td>Код та назва закладу в Реєстрі ЗСО</td><td>' + '(' + d.schoolId + ') ' + d.schoolName + '</td></tr>';
                            info += '<tr><td>Код ЄДРПОУ закладу в Реєстрі ЗСО</td><td>' + d.edrpo + '</td></tr>';
                            info += '<tr><td>Код та назва органу управління закладу в ЄДЕБО</td><td>' + '(' + d.universityId + ') ' + d.universityFullName + '</td></tr>';
                            info += '<tr><td>Тип закладу</td><td>' + d.schoolTypeName + '</td></tr>';
                            info += '<tr><td>Чи є закладом інтернатного типу</td><td>' + (d.isInternat ? 'так' : 'ні') + '</td></tr>';
                            info += '<tr><td>Форма власності</td><td>' + d.universityTypeOfFinfnsingName + '</td></tr>';
                            info += '<tr><td>Прізвище, ім\'я, по батькові керівника</td><td>' + d.bossLastName + ' ' + d.bossFirstName + ' ' + d.bossMiddleName + '</td></tr>';

                            info += '</table>';
                            info += '</div>';
                        } else {
                            info += '<div class="error">Документ не знайдено</div>'
                        }

                        buttons.push({
                            text: 'Закрити',
                            width: 150,
                            click: function () {
                                $(this).dialog('close');
                            }
                        });

                        $dlg = showMessage(info, 'Результат запиту', w, buttons)
                    }
                })
                .fail(function (jqXHR, e) {
                    requestStop();
                    showError(ajaxError(jqXHR, e));
                });
        } else {
            requestStop();
            showError('Помилка шифрування даних!');
        }
    }
}