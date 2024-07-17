var URL_XML_HTTP_PROXY_SERVICE = "/ProxyHandler.php";

var euSign = null,
    euSignInitialized = false,
    euSignCertificates = [],
    euSignSession = null,
    euSignSessionData = null;

var euSignLoaded = false;

var CAEDBO =
    [
        {
            "issuerCNs": ["Центр сертифікації ключів ДП \"Інфоресурс\""],
            "address": "csk.edbo.gov.ua",
            "ocspAccessPointAddress": "csk.edbo.gov.ua/services/ocsp/",
            "ocspAccessPointPort": "80",
            "cmpAddress": "csk.edbo.gov.ua",
            "tspAddress": "csk.edbo.gov.ua",
            "tspAddressPort": "80"
        }
    ];

function euSignShowError(err, msg) {
    console.log(err.GetMessage());
    try {
        showError((msg ? msg + '<br/>' : '') + err.GetMessage());
    } catch (x) {
        showError((msg ? msg + '<br/>' : '') + err);
    }
}

function EUSignCPModuleInitialized(isInitialized) {
    if (isInitialized) {
        try {
            euSign = EUSignCP();

            euSign.Initialize();
            if (!euSignSetSettings()) return;
            $('.eu-sign-loading').remove()

            euSignInitialized = true;
        } catch (e) {
            euSignShowError(e);
        }
        //showMessage('Криптографічну бібліотеку ініціалізовано', 'Система захисту');
    } else {
        showError('Помилка ініціалізації криптографічної бібліотеки!');
    }
}

function euSignSetSettings() {
    var settings;
    try {
        euSign.SetJavaStringCompliant(true);
        euSign.SetCharset('UTF-16LE');

        euSign.SetXMLHTTPProxyService(URL_XML_HTTP_PROXY_SERVICE);

        settings = euSign.CreateFileStoreSettings();
        settings.SetPath('');
        settings.SetSaveLoadedCerts(true);
        euSign.SetFileStoreSettings(settings);

        settings = euSign.CreateProxySettings();
        euSign.SetProxySettings(settings);

        settings = euSign.CreateTSPSettings();
        euSign.SetTSPSettings(settings);

        settings = euSign.CreateOCSPSettings();
        settings.SetUseOCSP(true);
        settings.SetBeforeStore(true);
        settings.SetAddress('');
        settings.SetPort('80');
        euSign.SetOCSPSettings(settings);

        settings = euSign.CreateCMPSettings();
        euSign.SetCMPSettings(settings);

        settings = euSign.CreateLDAPSettings();
        euSign.SetLDAPSettings(settings);

        settings = euSign.CreateOCSPAccessInfoModeSettings();
        settings.SetEnabled(true);
        euSign.SetOCSPAccessInfoModeSettings(settings);

        SetOCSPAccessInfoSettings(CAEDBO);
        return true;
    } catch (e) {
        euSignShowError(e, 'Помилка при налаштуванні криптографічної бібліотеки!');
    }
}

function SetOCSPAccessInfoSettings(arr) {
    var settings = euSign.CreateOCSPAccessInfoSettings();
    for (let i = 0; i < arr.length; i++) {
        settings.SetAddress(arr[ i ].ocspAccessPointAddress);
        settings.SetPort(arr[ i ].ocspAccessPointPort);

        for (let j = 0; j < arr[ i ].issuerCNs.length; j++) {
            settings.SetIssuerCN(arr[ i ].issuerCNs[ j ]);
            euSign.SetOCSPAccessInfoSettings(settings);
        }
    }
}

function certCount() {
    var k;
    $.ajax({
        url: '/_data.php', method: 'POST', datatype: 'text', async: false,
        data: { 'a': 'cert_count' }
    }).done(function (data) {
        k = data;
    });
    return +k;
}

function loadCert(p) {
    var b;
    $.ajax({
        url: '/_data.php', method: 'POST', datatype: 'text', async: false,
        data: { 'a': 'cert', 'p': p }
    }).done(function (data) {
        b = data;
    });
    return b;
}

function euSignLoadCertificates() {
    try {
        var k = certCount();
        if (k === 0) {
            euSignInitialized = false;
            showError('Сертифікати не знайдено!');
            return;
        }

        var certData;
        for (i = 0; i < k; i++) {
            certData = loadCert(i);
            if (!certData) {
                euSignInitialized = false;
                showError('Помилка завантаження сертифіката № ' + i + '!');
                return;
            }
            euSignCertificates.push(euSign.Base64Decode(certData));
        }

        for (i = 0; i < k; i++)
            euSign.SaveCertificate(euSignCertificates[ i ]);

        return true;
    } catch (e) {
        euSignShowError(e);
    }
}

function euSignEncode(data) {
    if (!euSignInitialized) {
        showError('Криптографічна бібліотека не ініціалізована!');
        return;
    }

    if (!euSignCertificates.length && !euSignLoadCertificates()) {
        showError('Помилка завантаження сертифікатів!');
        return;
    }

    try {
        var encodeData = euSign.EnvelopDataToRecipientsWithDynamicKey(
            [euSignCertificates[ 0 ]], false, false, data, true);
        return encodeData;
    } catch (e) {
        euSignShowError(e);
    }
}

function euSignInitSession() {
    if (euSignSession) return;

    if (!euSignInitialized) {
        showError('Криптографічна бібліотека не ініціалізована!');
        return;
    }

    if (!euSignCertificates.length && !euSignLoadCertificates()) return;

    try {
        euSignSession = euSign.ClientDynamicKeySessionCreate(3600, euSignCertificates[ 0 ]);
        euSignSessionData = euSign.Base64Encode(euSignSession.GetData());
        return euSignSessionData;
    } catch (e) {
        euSignShowError(e);
    }
}

function euSignEncodeSession(data) {
    if (!euSignInitialized) {
        showError('Криптографічна бібліотека не ініціалізована!');
        return;
    }

    try {
        euSignInitSession();

        return euSign.SessionEncrypt(euSignSession, data, true);
    } catch (e) {
        euSignShowError(e);
    }
}

function euSignDecodeSession(data) {
    if (!euSignInitialized) {
        showError('Криптографічна бібліотека не ініціалізована!');
        return;
    }

    if (!euSignSession) {
        showError('Захищена сесія не ініціалізована!');
        return;
    }

    try {
        return euSign.ArrayToString(euSign.SessionDecrypt(euSignSession, data));
    } catch (e) {
        euSignShowError(e);
    }
}

function encode(data, session) {
    if (euSignNoEncode) return data;
    if (session) euSignInitSession();
    return euSignEncode(data);
}

function decode(data) {
    if (euSignNoEncode) return data;
    return euSignDecodeSession(data);
}

function decodeFile(data) {
    if (euSignNoEncode) return euSign.Base64Decode(data);
    return euSign.Base64Decode(euSignDecodeSession(data));
}

jQuery.getCachedScript = function (url, options) {
    options = $.extend(options || {}, {
        dataType: "script",
        cache: true,
        url: url
    });

    return jQuery.ajax(options);
};

function loadEUSignLibraries() {
    if (!euSignLoaded) {
        $.getCachedScript("/js/euscp/euscpt.js")
            .done(function (script, textStatus) {
                $.getCachedScript("/js/euscp/euscpm.js")
                    .done(function (script, textStatus) {
                        $.getCachedScript("/js/euscp/euscp.js")
                            .done(function (script, textStatus) {
                                euSignLoaded = true;
                            })
                    })
            })
            .fail(function (jqxhr, settings, exception) {
            });
    }
}