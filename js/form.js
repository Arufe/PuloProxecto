// Formulario — validación, hCaptcha, envío vía Web3Forms, éxito y reset
(function () {
  "use strict";

  var config = window.PP_CONFIG || {};

  function dict() {
    return window.PP && window.PP.i18n ? window.PP.i18n.getDict() : {};
  }

  function currentLang() {
    return window.PP && window.PP.i18n ? window.PP.i18n.getCurrentLang() : "gl";
  }

  // Extrae el mensaje de error del servidor si lo trae (la respuesta de
  // Web3Forms anida el mensaje en "body" o lo pone en la raíz).
  function serverMessage(data) {
    if (!data) return "";
    if (typeof data.message === "string") return data.message;
    if (data.body && typeof data.body.message === "string") return data.body.message;
    return "";
  }

  function initForm() {
    var form = document.querySelector("[data-form]");
    if (!form) return;

    var successEl = form.querySelector("[data-form-success]");
    var submitBtn = form.querySelector("[data-submit]");
    var sendErrorEl = form.querySelector("[data-error-send]");
    var copyBtn = form.querySelector("[data-copy]");
    var mailtoLink = form.querySelector("[data-mailto]");
    var resetBtn = form.querySelector("[data-reset]");
    var lastMessage = "";
    var captchaLoaded = false;

    // hCaptcha solo se necesita al rellenar el formulario: se carga
    // el cliente de Web3Forms en la primera interacción (ahorra ~200 KiB
    // de JS en la carga inicial de la página).
    function loadCaptcha() {
      if (captchaLoaded) return;
      captchaLoaded = true;
      var script = document.createElement("script");
      script.src = "https://web3forms.com/client/script.js";
      script.async = true;
      document.body.appendChild(script);
    }

    function showError(field, key) {
      var wrapper = field.closest(".form-field");
      if (!wrapper) return;
      var errorEl = wrapper.querySelector("[data-error]");
      if (!errorEl) return;
      errorEl.textContent = dict()[key] || "";
      errorEl.hidden = false;
      wrapper.classList.add("has-error");
    }

    function clearError(field) {
      var wrapper = field.closest(".form-field");
      if (!wrapper) return;
      var errorEl = wrapper.querySelector("[data-error]");
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = "";
      }
      wrapper.classList.remove("has-error");
    }

    function setSending(sending) {
      if (!submitBtn) return;
      submitBtn.disabled = sending;
      var label = submitBtn.querySelector("span");
      if (label) {
        label.textContent = sending ? dict()["form.sending"] : dict()["form.submit"];
      }
    }

    function composeMessage(dict, values) {
      return (
        dict["form.name"] + ": " + values.name + "\n" +
        dict["form.org"] + ": " + (values.org || "-") + "\n" +
        dict["form.email"] + ": " + values.email + "\n\n" +
        dict["form.msg"] + ": " + values.message
      );
    }

    function storeMessage(values) {
      try {
        var stored = window.localStorage.getItem("pp-messages");
        var messages = stored ? JSON.parse(stored) : [];
        messages.push({ date: new Date().toISOString(), lang: currentLang(), data: values });
        window.localStorage.setItem("pp-messages", JSON.stringify(messages));
      } catch (error) {
        /* almacenamento non dispoñible */
      }
    }

    function showSuccess(values) {
      var translations = dict();
      lastMessage = composeMessage(translations, values);

      if (mailtoLink) {
        mailtoLink.setAttribute(
          "href",
          "mailto:" + config.CONTACT_EMAIL +
            "?subject=" + encodeURIComponent(translations["form.subject"]) +
            "&body=" + encodeURIComponent(lastMessage)
        );
      }

      form.classList.add("is-sent");
      if (sendErrorEl) sendErrorEl.hidden = true;
      if (successEl) successEl.hidden = false;
      storeMessage(values);
    }

    function validate() {
      var nameField = form.querySelector("#f-name");
      var emailField = form.querySelector("#f-email");
      var msgField = form.querySelector("#f-msg");
      var isValid = true;

      [nameField, emailField, msgField].forEach(clearError);
      if (successEl) successEl.hidden = true;
      if (sendErrorEl) sendErrorEl.hidden = true;

      if (!nameField.value.trim()) {
        showError(nameField, "err.required");
        isValid = false;
      }

      var emailValue = emailField.value.trim();
      if (!emailValue) {
        showError(emailField, "err.required");
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
        showError(emailField, "err.email");
        isValid = false;
      }

      if (!msgField.value.trim()) {
        showError(msgField, "err.required");
        isValid = false;
      }

      if (!isValid) return null;

      return {
        name: nameField.value.trim(),
        org: form.querySelector("#f-org").value.trim(),
        email: emailValue,
        message: msgField.value.trim()
      };
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var values = validate();
      if (!values) return;

      var captchaField = form.querySelector('textarea[name="h-captcha-response"]');
      if (captchaField && !captchaField.value) {
        loadCaptcha();
        if (sendErrorEl) {
          sendErrorEl.textContent = dict()["err.captcha"];
          sendErrorEl.hidden = false;
        }
        return;
      }

      setSending(true);

      // Envío como application/json (no FormData/multipart): la ruta multipart
      // de Web3Forms responde con una redirección que el navegador bloquea por
      // CORS — el correo se envía pero el fetch falla y mostraba error.
      // Ver docs oficiales de Web3Forms (Troubleshooting > CORS Error).
      var payload = {
        access_key: config.WEB3FORMS_KEY,
        subject: dict()["form.subject"],
        name: values.name,
        org: values.org,
        email: values.email,
        message: values.message
      };
      if (captchaField && captchaField.value) {
        payload["h-captcha-response"] = captchaField.value;
      }

      fetch(config.WEB3FORMS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          // Si la respuesta no es JSON (p. ej. un challenge HTML), seguimos con null.
          return response
            .json()
            .catch(function () { return null; })
            .then(function (data) {
              if (!response.ok || !data || !data.success) {
                throw new Error(serverMessage(data) || "HTTP " + response.status);
              }
              showSuccess(values);
            });
        })
        .catch(function (error) {
          console.error("[PuloProxecto] Error ao enviar o formulario:", error);
          if (sendErrorEl) {
            var base = dict()["err.send"];
            var detail = error && error.message ? error.message : "";
            sendErrorEl.textContent = detail && detail.indexOf("HTTP ") !== 0 ? base + " — " + detail : base;
            sendErrorEl.hidden = false;
          }
        })
        .then(function () {
          setSending(false);
        });
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (!lastMessage) return;
        var label = copyBtn.querySelector("span");
        var done = function () {
          if (!label) return;
          label.textContent = dict()["form.copied"];
          window.setTimeout(function () {
            label.textContent = dict()["form.copy"];
          }, 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(lastMessage).then(done);
        } else {
          var helper = document.createElement("textarea");
          helper.value = lastMessage;
          helper.setAttribute("readonly", "");
          helper.style.position = "absolute";
          helper.style.left = "-9999px";
          document.body.appendChild(helper);
          helper.select();
          document.execCommand("copy");
          document.body.removeChild(helper);
          done();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.classList.remove("is-sent");
        form.reset();
        if (successEl) successEl.hidden = true;
        form.querySelectorAll(".form-field.has-error").forEach(clearError);
      });
    }

    ["focusin", "pointerdown"].forEach(function (eventType) {
      form.addEventListener(eventType, loadCaptcha, { once: true });
    });

    ["input", "blur"].forEach(function (eventType) {
      form.addEventListener(eventType, function (event) {
        var field = event.target;
        if (field.matches("input, textarea") && field.closest(".form-field.has-error")) {
          if (field.value.trim()) clearError(field);
        }
      }, true);
    });
  }

  window.PP = window.PP || {};
  window.PP.form = {
    initForm: initForm
  };
}());
