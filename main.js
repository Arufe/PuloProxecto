// Orquestador — inicializa los módulos en orden
// Requiere que se hayan cargado antes, en este orden:
//   i18n/gl.js, i18n/es.js, js/config.js, js/i18n.js, js/header.js,
//   js/scroll.js, js/faq.js, js/form.js
(function () {
  "use strict";

  var PP = window.PP;
  if (!PP || !PP.i18n) return;

  // Marca para las animaciones de entrada (.reveal)
  document.documentElement.classList.add("js-enabled");

  // i18n primero: define el idioma y traduce los data-i18n que otros
  // módulos puedan leer (aria-labels, placeholders, etc.)
  PP.i18n.initI18n();

  // Header + menú móvil
  PP.header.initHeader();
  PP.header.updateHeader();
  window.addEventListener("scroll", PP.header.updateHeader, { passive: true });

  // Animaciones y navegación activa
  PP.scroll.initReveal();
  PP.scroll.initActiveNav();

  // FAQ y formulario
  PP.faq.initFaq();
  PP.form.initForm();
}());
