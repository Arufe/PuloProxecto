// i18n — traduce data-i18n / data-i18n-ph / data-i18n-aria
// Las traducciones vienen de i18n/gl.js y i18n/es.js -> window.PP_TRANSLATIONS
(function () {
  "use strict";

  var config = window.PP_CONFIG || {};
  var translations = window.PP_TRANSLATIONS || {};
  var root = document.documentElement;
  var currentLang = "gl";

  function getDict() {
    return translations[currentLang] || {};
  }

  function getCurrentLang() {
    return currentLang;
  }

  function readStoredLang() {
    try {
      var stored = window.localStorage.getItem(config.STORAGE_KEY);
      return stored === "es" || stored === "gl" ? stored : null;
    } catch (error) {
      return null;
    }
  }

  function saveLang(lang) {
    try {
      window.localStorage.setItem(config.STORAGE_KEY, lang);
    } catch (error) {
      /* almacenamento non dispoñible */
    }
  }

  function applyLang(lang) {
    currentLang = translations[lang] ? lang : "gl";
    var dict = translations[currentLang];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (typeof dict[key] === "string") el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (typeof dict[key] === "string") el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (typeof dict[key] === "string") el.setAttribute("aria-label", dict[key]);
    });

    root.setAttribute("lang", currentLang);
    document.title = dict["meta.title"] || document.title;

    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && dict["meta.description"]) {
      metaDescription.setAttribute("content", dict["meta.description"]);
    }

    document.querySelectorAll(".lang-btn").forEach(function (button) {
      var isActive = button.getAttribute("data-lang") === currentLang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    var menuToggle = document.querySelector(".menu-toggle");
    if (menuToggle && menuToggle.getAttribute("aria-expanded") !== "true") {
      menuToggle.setAttribute("aria-label", dict["menu.open"]);
    }

    document.querySelectorAll(".h-captcha").forEach(function (widget) {
      widget.setAttribute("data-lang", currentLang);
    });
  }

  function initI18n() {
    document.querySelectorAll(".lang-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var lang = button.getAttribute("data-lang");
        if (lang !== currentLang) {
          saveLang(lang);
          applyLang(lang);
        }
      });
    });

    applyLang(readStoredLang() || "gl");
  }

  window.PP = window.PP || {};
  window.PP.i18n = {
    applyLang: applyLang,
    initI18n: initI18n,
    getDict: getDict,
    getCurrentLang: getCurrentLang
  };
}());
