var r = document.getElementById("record_msg");

function webkitSpeech() {
  if ("webkitSpeechRecognition" in window) {
    //Web speech API Function
    var speechRecognizer = new webkitSpeechRecognition();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults = true;
    // 언어 선택
    speechRecognizer.lang = "ko-KR";
    speechRecognizer.start();

    var finalTranscripts = "";
    speechRecognizer.onresult = function (event) {
      var interimTranscripts = "";
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var transcript = event.results[i][0].transcript;
        transcript.replace("\n", "<br>");

        //isFinal : if speech recognition is finished, isFinal = true
        if (event.results[i].isFinal) {
          finalTranscripts += transcript;
        } else {
          interimTranscripts += transcript;
        }
      }
      //insert into HTML
      r.innerHTML =
        finalTranscripts +
        '<span style="color:#999">' +
        interimTranscripts +
        "</span>";
    };
    speechRecognizer.onerror = function (event) {};
  } else {
    //if browser don't support this function. this message will show in your web
    r.innerHTML =
      "your browser is not supported. If google chrome. Please upgrade!";
  }
}
