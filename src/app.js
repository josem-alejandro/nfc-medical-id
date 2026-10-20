import { privacyPage, consentMarkup } from "./privacy.js";
import { stage } from "./forms.js";
import { config, steps } from "./config.js";
import {
  emptyProfile,
  demoProfile,
  validate,
  escapeHtml as h,
  publicProfile,
  validateConsent,
} from "./model.js";
import { DemoRepository } from "./storage.js";
import { icon, profileContent } from "./ui.js";
const repository = new DemoRepository();
let saved = repository.read();
let draft = saved?.profile || emptyProfile(),
  step = saved?.step || 0,
  errors = {},
  review = false;
if (draft.consentVersion !== config.privacyVersion) draft.consent = false;
let furthestStep = saved?.publishedProfile
  ? steps.length - 1
  : Math.max(step, saved?.furthestStep || 0);
let storageOk = true;
const app = document.querySelector("#app");
function toast(text) {
  document.querySelector("#toast").textContent = text;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(
    () => (document.querySelector("#toast").textContent = ""),
    3500,
  );
}
function persist(publish = false) {
  furthestStep = Math.max(furthestStep, step);
  storageOk = repository.save(draft, step, publish, furthestStep);
  saved = {
    profile: structuredClone(draft),
    furthestStep,
    step,
    published: publish || !!saved?.publishedProfile,
    publishedProfile: publish
      ? structuredClone(draft)
      : saved?.publishedProfile,
  };
  let el = document.querySelector("#save-state");
  if (el)
    el.textContent = storageOk
      ? "Progreso guardado en este navegador"
      : "No se pudo guardar: conserva esta pestaña abierta";
}
function header() {
  return `<header class="header"><span class="app-title">Identificación médica</span><span class="demo-pill">Demo</span></header>`;
}
function go(url) {
  location.hash = url;
}
function render() {
  let route = location.hash.slice(1) || "/";
  app.innerHTML = header() + `<main id="main" tabindex="-1"></main>`;
  let main = document.querySelector("#main");
  if (route === "/privacidad") {
    main.className = "privacy-page";
    main.innerHTML = privacyPage();
  } else if (route === "/registro") {
    form(main);
  } else if (route.startsWith("/perfil/")) {
    profile(main, route.split("/")[2]);
  } else {
    if (saved?.publishedProfile) profile(main, saved.publishedProfile.id);
    else form(main);
  }
  bind();
}
function form(main) {
  main.className = "registration";
  main.innerHTML = `<aside class="steps-panel">${saved?.publishedProfile ? `<a class="back-link" href="#/perfil/${h(saved.publishedProfile.id)}">← Volver a mi ficha</a>` : ""}<h1>Registro</h1><nav aria-label="Pasos del registro"><ol>${steps.map((s, i) => `<li class="${i === step ? "active" : i < furthestStep ? "complete" : ""}"><button type="button" class="step-button" data-step="${i}" aria-label="Paso ${i + 1}: ${h(s)}" ${i === step ? 'aria-current="step"' : ""} ${i > furthestStep ? "disabled" : ""}><span class="step-number">${i < furthestStep && i !== step ? icon("check") : String(i + 1).padStart(2, "0")}</span><span class="step-label">${h(s)}</span><span class="step-mobile-label" aria-hidden="true">${["Datos", "Salud", "Contactos", "Seguro", "Revisión"][i]}</span></button></li>`).join("")}</ol></nav><p class="fine" id="save-state">${storageOk ? "Progreso guardado en este navegador" : "No se pudo guardar el progreso"}</p></aside><div class="form-panel"><div class="progress-meta"><span>Paso ${step + 1} de 5</span><span>${Math.round(((step + 1) / 5) * 100)} %</span></div><progress max="5" value="${step + 1}" aria-label="Progreso del registro"></progress><div class="form-heading"><h2>${review ? "Revisa tu ficha" : steps[step]}</h2><p>${review ? "Comprueba la información antes de guardarla." : ""}</p></div><form novalidate>${review ? `<div class="review">${profileContent(draft, { owner: true, review: true })}</div>${consentMarkup(draft.consent)}<p class="error" id="consent-error">${h(errors.consent || "")}</p>` : stage(step, draft, errors)}<div class="form-actions"><button class="secondary" type="button" id="back" ${step === 0 && !review ? "disabled" : ""}>Atrás</button><button class="primary" type="submit">${review ? "Guardar ficha" : step === 4 ? "Revisar información" : "Continuar"} ${icon(review ? "check" : "arrow")}</button></div></form></div>`;
}
function profile(main, id) {
  let p =
    id === config.demoId
      ? demoProfile()
      : saved?.publishedProfile && id === saved.publishedProfile.id
        ? saved.publishedProfile
        : null;
  main.className = "profile-page";
  if (!p) {
    main.innerHTML = `<div class="empty-state"><h1>Ficha no disponible</h1><p>Esta ficha de prueba no está guardada en este navegador. No se han encontrado datos para este identificador.</p><a class="primary" href="#/registro">Ir al registro</a></div>`;
    return;
  }
  let owner = id !== config.demoId && !location.hash.endsWith("/consulta");
  let publicData = owner ? p : publicProfile(p);
  main.innerHTML = `${owner ? `<div class="profile-toolbar"><button type="button" class="text-link" id="edit">${icon("edit")} Editar información</button></div>` : ""}${profileContent(publicData, { owner })}<div class="emergency-bar"><a class="emergency" href="tel:${h(config.emergencyNumber)}">${icon("phone")} LLAMAR A EMERGENCIAS</a></div>`;
}
function update(name, value) {
  if (name === "consent") {
    draft.consent = value;
    draft.consentVersion = value ? config.privacyVersion : null;
    if (!value) draft.consentRecord = null;
    return false;
  }
  if (name.startsWith("medical-")) {
    let k = name.slice(8);
    draft.medical[k].status = value;
    if (value === "provided" && !draft.medical[k].items.length)
      draft.medical[k].items = [""];
    return true;
  }
  if (name.startsWith("record-")) {
    let [, k, i] = name.split("-");
    draft.medical[k].items[Number(i)] = value;
  } else if (name.startsWith("contact-")) {
    let [, i, k] = name.split("-");
    draft.contacts[Number(i)][k] = value;
  } else if (["company", "plan", "member"].includes(name))
    draft.insurance[name] = value;
  else if (name === "insurancePhone") draft.insurance.phone = value;
  else if (name === "insurancePrefix") draft.insurance.prefix = value;
  else draft[name] = value;
  return false;
}
function bind() {
  document.querySelector(".skip").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#main").focus();
  });
  app.querySelectorAll("[data-step]").forEach((button) =>
    button.addEventListener("click", () => {
      const target = Number(button.dataset.step);
      if (
        !Number.isInteger(target) ||
        target < 0 ||
        target > furthestStep ||
        target >= steps.length
      )
        return;
      step = target;
      review = false;
      errors = {};
      persist();
      render();
      const heading = document.querySelector(".form-heading h2");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }),
  );
  let f = app.querySelector("form");
  if (f) {
    f.addEventListener("input", (e) => {
      let t = e.target;
      if (!t.name) return;
      let rerender = update(
        t.name,
        t.type === "checkbox" ? t.checked : t.value,
      );
      persist();
      if (rerender) render();
    });
    f.addEventListener("focusout", (e) => {
      let t = e.target;
      if (!t.name) return;
      let msg = validate(draft, step)[t.name] || "";
      let span = document.getElementById(t.name + "-error");
      if (span) {
        span.textContent = msg;
        t.setAttribute("aria-invalid", String(!!msg));
      }
    });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (review) {
        errors = {};
        for (let i = 0; i < 4; i++) {
          let err = validate(draft, i);
          if (Object.keys(err).length) {
            step = i;
            review = false;
            errors = err;
            render();
            focusError();
            return;
          }
        }
        if (!validateConsent(draft)) {
          errors.consent =
            "Lee el aviso y marca la casilla de aceptación para guardar esta ficha de ejemplo.";
          render();
          document.querySelector('[name="consent"]').focus();
          return;
        }
        draft.updatedAt = new Date().toISOString();
        draft.consentRecord = {
          version: config.privacyVersion,
          acceptedAt: draft.updatedAt,
          mode: "demo",
          purpose: "nfc-medical-id",
        };
        persist(true);
        review = false;
        go("/perfil/" + draft.id);
        toast(
          storageOk
            ? "Ficha de prueba guardada"
            : "Ficha abierta, pero no se pudo guardar en el navegador",
        );
        return;
      }
      errors = validate(draft, step);
      if (Object.keys(errors).length) {
        render();
        focusError();
        return;
      }
      if (step < 4) {
        step++;
        toast("Etapa completada");
      } else review = true;
      persist();
      render();
      window.scrollTo({ top: 0 });
      document
        .querySelector(".form-heading h2")
        ?.scrollIntoView({ block: "nearest" });
    });
    document.querySelector("#back")?.addEventListener("click", () => {
      if (review) review = false;
      else step = Math.max(0, step - 1);
      errors = {};
      persist();
      render();
    });
  }
  app.querySelectorAll("[data-add]").forEach((b) =>
    b.addEventListener("click", () => {
      draft.medical[b.dataset.add].items.push("");
      persist();
      render();
    }),
  );
  app.querySelectorAll("[data-remove]").forEach((b) =>
    b.addEventListener("click", () => {
      let [k, i] = b.dataset.remove.split(":");
      draft.medical[k].items.splice(+i, 1);
      persist();
      render();
    }),
  );
  document.querySelector("#edit")?.addEventListener("click", () => {
    step = 0;
    review = false;
    errors = {};
    go("/registro");
  });
}
function focusError() {
  let first = app.querySelector('[aria-invalid="true"]');
  if (first) first.focus();
  else
    app
      .querySelector(".error:not(:empty)")
      ?.scrollIntoView({ block: "center" });
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
  ) {
    document.startViewTransition(update);
  } else update();
});
render();
