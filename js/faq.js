// FAQ — acordeón exclusivo (solo una pregunta abierta)
(function () {
  "use strict";

  function initFaq() {
    var questions = document.querySelectorAll(".faq-list details");
    questions.forEach(function (question) {
      question.addEventListener("toggle", function () {
        if (!question.open) return;
        questions.forEach(function (other) {
          if (other !== question) other.open = false;
        });
      });
    });
  }

  window.PP = window.PP || {};
  window.PP.faq = {
    initFaq: initFaq
  };
}());
