import { escapeHtml as h, normalizePhone } from "./model.js";
export function icon(name) {
  const paths = {
    phone:
      "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z",
    edit: "m16 3 5 5M4 20l4-1L21 6a2 2 0 0 0-3-3L5 16z",
    arrow: "M5 12h14m-5-5 5 5-5 5",
  };
  return `<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.arrow}"/></svg>`;
}
export function field(label, name, value = "", options = {}) {
  const {
    type = "text",
    error = "",
    max = "",
    maxlength = 180,
    inputmode = "",
    pattern = "",
    autocomplete = "off",
    placeholder = "",
    hint = "",
  } = options;
  return `<div class="field"><label for="${name}">${h(label)}</label><input id="${name}" name="${name}" type="${type}" value="${h(value)}" required maxlength="${maxlength}" autocomplete="${autocomplete}" ${max ? `max="${max}"` : ""} ${inputmode ? `inputmode="${inputmode}"` : ""} ${pattern ? `pattern="${pattern}"` : ""} placeholder="${h(placeholder)}" aria-describedby="${name}-error${hint ? ` ${name}-hint` : ""}" ${error ? 'aria-invalid="true"' : ""}>${hint ? `<small class="hint" id="${name}-hint">${h(hint)}</small>` : ""}<span class="error" id="${name}-error">${h(error)}</span></div>`;
}
export function bloodField(value, options, error = "") {
  return `<div class="field"><label for="blood">Grupo sanguíneo</label><select id="blood" name="blood" aria-describedby="blood-error" ${error ? 'aria-invalid="true"' : ""}>${options.map((v) => `<option ${v === value ? "selected" : ""}>${h(v)}</option>`).join("")}</select><span class="error" id="blood-error">${h(error)}</span></div>`;
}
export function profileContent(p) {
  const birth = p.birthDate
    ? new Date(p.birthDate + "T12:00:00").toLocaleDateString("es-EC", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No proporcionada";
  return `<div class="identity"><div class="eyebrow">IDENTIFICACIÓN</div><h1>${h(p.firstName)}<br>${h(p.lastName)}</h1></div><section class="card profile-details"><dl><div><dt>Fecha de nacimiento</dt><dd>${h(birth)}</dd></div><div><dt>Grupo sanguíneo</dt><dd>${h(p.blood)}</dd></div><div><dt>Código Banner</dt><dd class="digits">${h(p.banner) || "No proporcionado"}</dd></div></dl></section><section class="card emergency-contact"><div><h2>Teléfono de emergencia</h2><a class="number" href="tel:${h(normalizePhone(p.emergencyPhone))}">${h(normalizePhone(p.emergencyPhone))}</a></div><a class="primary" href="tel:${h(normalizePhone(p.emergencyPhone))}" aria-label="Llamar al teléfono de emergencia">${icon("phone")} Llamar</a></section>`;
}
