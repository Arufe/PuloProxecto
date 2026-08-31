// Orquestador — inicializa los módulos en orden
// Requiere que se hayan cargado antes, en este orden:
//   i18n/gl.js, i18n/es.js, js/config.js, js/i18n.js, js/header.js,
//   js/scroll.js, js/faq.js, js/form.js
// Cada módulo se inicializa de forma independiente: si uno falla,
// el resto de la página sigue funcionando.
(function () {
  "use strict";

  // Posición de scroll inicial: se lee antes de cualquier escritura en
  // el DOM para no forzar un reflow al inicializar el header.
  var initialScrollY = window.scrollY;

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
  if (PP.header && typeof PP.header.updateHeader === "function") {
    PP.header.updateHeader(initialScrollY);
    window.addEventListener("scroll", function () {
      PP.header.updateHeader(window.scrollY);
    }, { passive: true });
  }

  // 4. Navegación activa, FAQ y formulario
  safe("scroll.activeNav", PP.scroll, "initActiveNav");
  safe("faq", PP.faq, "initFaq");
  safe("form", PP.form, "initForm");
}());
