import { stage } from "./forms.js";
import { config, steps } from "./config.js";
import {
  emptyProfile,
  demoProfile,
  validate,
  escapeHtml as h,
  publicProfile,
} from "./model.js";
import { DemoRepository } from "./storage.js";
import { icon, profileContent } from "./ui.js";
const repository = new DemoRepository();
let saved = repository.read();
let draft = saved?.profile || emptyProfile(),
  step = saved?.step || 0,
  errors = {},
  review = false;
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
  storageOk = repository.save(draft, step, publish);
  saved = {
    profile: structuredClone(draft),
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
  return `<header class="header"><a class="brand" href="#/">${icon("plus")}<span>TAPEC<span class="brand-sub">Medical ID</span></span></a><span class="demo-pill">Demostración</span></header><div class="demo-notice">Solo datos ficticios. Se guardan en este navegador; no hay almacenamiento médico seguro.</div>`;
}
function footer() {
  return `<footer><span>TAPEC · Identificación que acompaña.</span><span>Demostración NFC · Ecuador</span></footer>`;
}
function go(url) {
  location.hash = url;
}
function render() {
  let route = location.hash.slice(1) || "/";
  app.innerHTML = header() + `<main id="main" tabindex="-1"></main>` + footer();
  let main = document.querySelector("#main");
  if (route === "/registro") {
    form(main);
  } else if (route.startsWith("/perfil/")) {
    profile(main, route.split("/")[2]);
  } else {
    home(main);
  }
  bind();
}
function home(main) {
  main.innerHTML = `<div class="home-head"><div class="eyebrow">IDENTIFICACIÓN MÉDICA NFC</div><h1>Lo esencial.<br>Cuando más importa.</h1><p class="lead">Tu información de emergencia,<br>a un toque de distancia.</p></div><div class="home-grid"><a class="entry primary-entry" href="#/registro"><div class="entry-top">${icon("plus")}<span>01 / REGISTRO</span></div><h2>Crea tu ficha médica</h2><p>Organiza tu información en cinco pasos.<br>Prueba con datos ficticios.</p><span class="entry-action">${saved ? "Continuar registro" : "Comenzar"} ${icon("arrow")}</span></a><a class="entry" href="#/perfil/${config.demoId}"><div class="entry-top">${icon("signal")}<span>02 / CONSULTA</span></div><h2>Explora una ficha</h2><p>Así se ve la información al acercar<br>un teléfono a una pulsera NFC.</p><span class="entry-action">Ver demostración ${icon("arrow")}</span></a></div>${saved?.published ? `<a class="text-link saved-link" href="#/perfil/${h(draft.id)}">Abrir mi ficha de prueba ${icon("arrow")}</a>` : ""}<div class="home-bottom">${icon("shield")}<p><strong>Primero, tu información esencial.</strong><br>El acceso entre dispositivos estará disponible al integrar un backend seguro.</p></div>`;
}
function form(main) {
  let intros = [
    "Empecemos por lo esencial.",
    "Información que puede ayudar.",
    "A quién contactar.",
    "Tu cobertura, a mano.",
    "Un último detalle.",
  ];
  main.className = "registration";
  main.innerHTML = `<aside class="steps-panel"><a class="back-link" href="#/">← Inicio</a><div class="eyebrow">CREA TU FICHA</div><h1>Tu información.<br>Con claridad.</h1><ol>${steps.map((s, i) => `<li class="${i === step ? "active" : i < step ? "complete" : ""}" ${i === step ? 'aria-current="step"' : ""}><span>${i < step ? icon("check") : String(i + 1).padStart(2, "0")}</span>${s}</li>`).join("")}</ol><p class="fine" id="save-state">${storageOk ? "Progreso guardado en este navegador" : "No se pudo guardar el progreso"}</p></aside><div class="form-panel"><div class="progress-meta"><span>Paso ${step + 1} de 5</span><span>${Math.round(((step + 1) / 5) * 100)} %</span></div><progress max="5" value="${step + 1}" aria-label="Progreso del registro"></progress><div class="form-heading"><h2>${review ? "Revisa tu ficha" : intros[step]}</h2><p>${review ? "Comprueba la información antes de guardarla." : steps[step]}</p></div><form novalidate>${review ? `<div class="review">${profileContent(draft, { owner: true, review: true })}</div><label class="consent"><input name="consent" type="checkbox" ${draft.consent ? "checked" : ""} required> Confirmo que son datos ficticios y que deseo mostrarlos en la ficha de prueba.</label><p class="error" id="consent-error">${h(errors.consent || "")}</p>` : stage(step, draft, errors)}<div class="form-actions"><button class="secondary" type="button" id="back" ${step === 0 && !review ? "disabled" : ""}>Atrás</button><button class="primary" type="submit">${review ? "Guardar ficha" : step === 4 ? "Revisar información" : "Continuar"} ${icon(review ? "check" : "arrow")}</button></div></form></div>`;
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
    main.innerHTML = `<div class="empty-state"><h1>Ficha no disponible</h1><p>Esta ficha de prueba no está guardada en este navegador. No se han encontrado datos para este identificador.</p><a class="primary" href="#/perfil/${config.demoId}">Ver ficha de demostración</a></div>`;
    return;
  }
  let owner = id !== config.demoId && !location.hash.endsWith("/consulta");
  let publicData = owner ? p : publicProfile(p);
  main.innerHTML = `<div class="profile-toolbar"><a class="back-link" href="#/">← Inicio</a><span class="demo-label">FICHA DE PRUEBA</span>${owner ? `<button type="button" class="text-link" id="edit">${icon("edit")} Editar</button>` : `<a class="text-link" href="#/registro">Crear ficha ${icon("plus")}</a>`}</div>${profileContent(publicData, { owner })}${owner ? `<div class="local-info"><strong>Guardada en este navegador</strong><p>El enlace de esta ficha no transporta datos ni funciona en otros dispositivos.</p><a class="text-link" href="#/perfil/${h(p.id)}/consulta">Ver ficha de consulta ${icon("arrow")}</a></div>` : `<p class="fine profile-disclaimer">Vista de consulta · Solo información ficticia. No se expone el número de afiliación.</p>`}<div class="emergency-bar"><div><strong>¿Necesitas ayuda inmediata?</strong><small>Emergencias · Ecuador · ${h(config.emergencyNumber)}</small></div><a class="emergency" href="tel:${h(config.emergencyNumber)}">${icon("phone")} LLAMAR A EMERGENCIAS</a></div><p class="fine emergency-note">Abre el marcador del teléfono. No inicia una llamada automáticamente.</p>`;
}
function update(name, value) {
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
  else draft[name] = value;
  return false;
}
function bind() {
  document.querySelector(".skip").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#main").focus();
  });
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
        if (!draft.consent) {
          errors.consent = "Confirma el uso exclusivo de datos ficticios.";
          render();
          document.querySelector('[name="consent"]').focus();
          return;
        }
        draft.updatedAt = new Date().toISOString();
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
  render();
  window.scrollTo({ top: 0 });
});
render();
