import { config } from "./config.js";
import {
  emptyProfile,
  demoProfile,
  cleanProfile,
  validate,
  validateConsent,
  escapeHtml as h,
} from "./model.js";
import { DemoRepository } from "./storage.js";
import { registrationFields } from "./forms.js";
import { consentMarkup, privacyPage } from "./privacy.js";
import { icon, profileContent } from "./ui.js";
const repository = new DemoRepository();
let saved = repository.read();
let draft = cleanProfile(saved?.profile) || emptyProfile();
let errors = {};
let saveFailed = false;
const app = document.querySelector("#app");
function toast(message) {
  document.querySelector("#toast").textContent = message;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(
    () => (document.querySelector("#toast").textContent = ""),
    3000,
  );
}
function render() {
  const route = location.hash.slice(1) || "/";
  app.innerHTML = `<header class="header"><span class="app-title">Identificación médica</span><span class="demo-pill">Demo</span></header><main id="main" tabindex="-1"></main>`;
  const main = document.querySelector("#main");
  if (route === "/privacidad") {
    main.className = "privacy-page";
    main.innerHTML = privacyPage();
  } else if (route === "/registro") {
    renderForm(main);
  } else if (route.startsWith("/perfil/")) {
    renderProfile(main, route.split("/")[2]);
  } else if (saved?.publishedProfile) {
    renderProfile(main, saved.publishedProfile.id);
  } else renderForm(main);
  bind();
}
function renderForm(main) {
  main.className = "registration";
  main.innerHTML = `${saved?.publishedProfile ? `<a class="back-link" href="#/perfil/${h(saved.publishedProfile.id)}">← Volver a mi ficha</a>` : ""}<section class="form-panel"><div class="form-heading"><h1>Identificación</h1></div><form novalidate>${registrationFields(draft, errors)}${consentMarkup(draft.consentChoice, errors.consent)}<div class="form-actions"><button class="primary" type="submit" ${validateConsent(draft) ? "" : "disabled"}>Generar ficha ${icon("arrow")}</button></div></form>${saveFailed ? '<p class="error" role="status">No se pudo guardar en este navegador. La ficha seguirá disponible mientras esta pestaña permanezca abierta.</p>' : ""}</section>`;
}
function renderProfile(main, id) {
  main.className = "profile-page";
  const p =
    id === config.demoId
      ? demoProfile()
      : saved?.publishedProfile?.id === id
        ? saved.publishedProfile
        : null;
  if (!p) {
    main.innerHTML =
      '<section class="empty-state"><h1>Ficha no disponible</h1><a class="primary" href="#/registro">Ir al formulario</a></section>';
    return;
  }
  const owner = id !== config.demoId && !location.hash.endsWith("/consulta");
  main.innerHTML = `${owner ? `<div class="profile-toolbar"><button class="text-link" id="edit" type="button">${icon("edit")} Editar información</button></div>` : ""}${profileContent(p)}${saveFailed ? '<p class="error" role="status">La ficha no se pudo guardar en este navegador.</p>' : ""}`;
}
function showConsentState() {
  const message = document.querySelector("#consent-state");
  if (message) {
    message.hidden = draft.consentChoice !== "decline";
    message.textContent =
      draft.consentChoice === "decline"
        ? "Tu ficha no se podrá generar si no aceptas la política de privacidad."
        : "";
  }
  const submit = document.querySelector('button[type="submit"]');
  if (submit) submit.disabled = !validateConsent(draft);
}
function bind() {
  document.querySelector(".skip").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#main").focus();
  });
  const form = app.querySelector("form");
  if (form) {
    form.addEventListener("input", (event) => {
      const input = event.target;
      if (input.name === "consentChoice") {
        draft.consentChoice = input.value;
        draft.consentVersion =
          input.value === "accept" ? config.privacyVersion : null;
        draft.consentRecord = null;
        showConsentState();
      } else if (
        [
          "firstName",
          "lastName",
          "birthDate",
          "blood",
          "banner",
          "emergencyPhone",
        ].includes(input.name)
      ) {
        draft[input.name] = input.value;
      }
    });
    form.addEventListener("focusout", (event) => {
      const input = event.target;
      const error = document.getElementById(input.name + "-error");
      if (error) {
        const message = validate(draft)[input.name] || "";
        error.textContent = message;
        input.setAttribute("aria-invalid", String(!!message));
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      errors = validate(draft);
      if (!validateConsent(draft))
        errors.consent =
          draft.consentChoice === "decline"
            ? "Tu ficha no se podrá generar si no aceptas la política de privacidad."
            : "Selecciona Acepto o No acepto.";
      if (Object.keys(errors).length) {
        render();
        const invalid =
          app.querySelector('[aria-invalid="true"]') ||
          app.querySelector('[name="consentChoice"]');
        invalid?.focus();
        return;
      }
      draft.updatedAt = new Date().toISOString();
      draft.consentRecord = {
        version: config.privacyVersion,
        acceptedAt: draft.updatedAt,
        mode: "demo",
      };
      saveFailed = !repository.save(draft);
      saved = {
        profile: cleanProfile(draft),
        publishedProfile: cleanProfile(draft),
      };
      const route = "/perfil/" + draft.id;
      if (location.hash.slice(1) === route) render();
      else location.hash = route;
      toast(saveFailed ? "Ficha abierta sin guardar" : "Ficha guardada");
    });
  }
  document.querySelector("#edit")?.addEventListener("click", () => {
    draft = cleanProfile(saved.publishedProfile);
    errors = {};
    location.hash = "/registro";
  });
}
window.addEventListener("hashchange", () => {
  const update = () => {
    render();
    window.scrollTo({ top: 0 });
    document.querySelector("#main").focus({ preventScroll: true });
  };
  if (
    document.startViewTransition &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    document.startViewTransition(update);
  else update();
});
render();
