$(function () {

    $('#wrapper #main-menu #toggle-tts').click(function () {
        brownies.cookies.tts = !brownies.cookies.tts;
        $(this).toggleClass("fa-volume-up fa-volume-mute");
        changeTextToSpeach();
    });

    $(document).ready(function (){
       $(document).mouseup(function (e){
          setTimeout(function() {
           textToSpeach(getSelectionText());
          }, 1);
       });
    });

    $('a').mouseenter(function() {
       textToSpeach($(this).text());
    });

    // changeTextToSpeach();
});

function changeTextToSpeach() {
    if (brownies.cookies.tts == true) {
        alert("Увімкнуто озвучування назв розділів, пунктів, заголовків");
    } else alert("Ви вимкнули озвучування назв розділів, пунктів, заголовків");
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    // for Internet Explorer 8 and below. For Blogger, you should use &amp;&amp; instead of &&.
    } else if (document.selection && document.selection.type != "Control") { 
        text = document.selection.createRange().text;
    }
    return text;
}

function textToSpeach(text) {
    if (brownies.cookies.tts == true) {
        responsiveVoice.cancel();
        responsiveVoice.setTextReplacements([{
           searchvalue: "ЄДЕБО",
           newvalue: "ЄДБО"
        }]);
        responsiveVoice.speak(text, "Ukrainian Female");
    }
}