// Orquestador — inicializa los módulos en orden
// Requiere que se hayan cargado antes, en este orden:
//   i18n/gl.js, i18n/es.js, js/config.js, js/i18n.js, js/header.js,
//   js/scroll.js, js/faq.js, js/form.js
// Cada módulo se inicializa de forma independiente: si uno falla,
// el resto de la página sigue funcionando.
(function () {
  "use strict";

  var PP = window.PP;
  if (!PP) return;

  function safe(name, module, method) {
    if (!module || typeof module[method] !== "function") return;
    try {
      module[method]();
    } catch (error) {
      if (window.console && console.error) {
        console.error("[PuloProxecto] Error al iniciar " + name + ":", error);
      }
    }
  }

  // 1. Animaciones primero: marcan el contenido como visible cuanto antes.
  //    La clase js-enabled solo se aplica si el módulo de scroll está cargado,
  //    para que el contenido nunca quede oculto sin motivo.
  if (PP.scroll) {
    document.documentElement.classList.add("js-enabled");
  }
  safe("scroll.reveal", PP.scroll, "initReveal");

  // 2. Idioma: traduce data-i18n antes de que otros módulos lean textos
  safe("i18n", PP.i18n, "initI18n");

  // 3. Header + menú móvil
  safe("header", PP.header, "initHeader");
  safe("header.updateHeader", PP.header, "updateHeader");
  if (PP.header && typeof PP.header.updateHeader === "function") {
    window.addEventListener("scroll", PP.header.updateHeader, { passive: true });
  }

  // 4. Navegación activa, FAQ y formulario
  safe("scroll.activeNav", PP.scroll, "initActiveNav");
  safe("faq", PP.faq, "initFaq");
  safe("form", PP.form, "initForm");
}());
