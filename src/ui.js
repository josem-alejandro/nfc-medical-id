import { escapeHtml as h, age, normalizePhone } from "./model.js";
import { config, medicalFields, statusLabels } from "./config.js";
export const icon = (name, cls = "") => {
  const paths = {
    plus: "M12 5v14M5 12h14",
    phone:
      "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z",
    arrow: "M5 12h14m-5-5 5 5-5 5",
    check: "m5 12 4 4L19 6",
    edit: "m16 3 5 5M4 20l4-1L21 6a2 2 0 0 0-3-3L5 16z",
    shield: "M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7z",
    signal: "M8 8a6 6 0 0 1 0 8m4-12a12 12 0 0 1 0 16m4-20a18 18 0 0 1 0 24",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  };
  return `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.plus}"/></svg>`;
};
export function field(label, name, value = "", opts = {}) {
  let {
    type = "text",
    error = "",
    required = false,
    placeholder = "",
    max = "",
    autocomplete = "off",
    maxlength = 180,
    inputmode = "",
    pattern = "",
  } = opts;
  return `<div class="field"><label for="${name}">${h(label)}${required ? ' <span aria-hidden="true">*</span>' : ""}</label><input id="${name}" name="${name}" type="${type}" value="${h(value)}" ${required ? "required" : ""} ${max ? `max="${max}"` : ""} maxlength="${maxlength}" ${pattern ? `pattern="${h(pattern)}"` : ""} autocomplete="${autocomplete}" ${inputmode || type === "tel" ? `inputmode="${inputmode || "tel"}"` : ""} placeholder="${h(placeholder)}" ${error ? `aria-invalid="true" aria-describedby="${name}-error"` : ""}><span class="error" id="${name}-error">${h(error)}</span></div>`;
}
export function select(label, name, value, options) {
  return `<div class="field"><label for="${name}">${h(label)}</label><select id="${name}" name="${name}">${options
    .map((o) => {
      let [v, l] = Array.isArray(o) ? o : [o, o];
      return `<option value="${h(v)}" ${v === value ? "selected" : ""}>${h(l)}</option>`;
    })
    .join("")}</select></div>`;
}
export function phoneFields(
  label,
  name,
  value,
  prefixName,
  prefix,
  error = "",
  required = false,
) {
  const country = prefix || config.defaultPrefix;
  const countries = [
    ["+593", "Ecuador +593"],
    ["+57", "Colombia +57"],
    ["+51", "Perú +51"],
    ["+1", "EE. UU. / Canadá +1"],
    ["+34", "España +34"],
    ["+54", "Argentina +54"],
    ["+56", "Chile +56"],
    ["+52", "México +52"],
    ["+58", "Venezuela +58"],
    ["+55", "Brasil +55"],
    ["+598", "Uruguay +598"],
    ["+591", "Bolivia +591"],
    ["+595", "Paraguay +595"],
    ["+507", "Panamá +507"],
    ["+506", "Costa Rica +506"],
    ["+502", "Guatemala +502"],
    ["+503", "El Salvador +503"],
    ["+504", "Honduras +504"],
    ["+505", "Nicaragua +505"],
    ["+44", "Reino Unido +44"],
    ["+49", "Alemania +49"],
    ["+33", "Francia +33"],
    ["+39", "Italia +39"],
    ["+61", "Australia +61"],
    ["+81", "Japón +81"],
    ["+86", "China +86"],
    ["+91", "India +91"],
  ];
  if (!countries.some(([code]) => code === country))
    countries.push([country, country]);
  return `<div class="phone-fields">${select("Código de país", prefixName, country, countries)}${field(label, name, value, { type: "tel", required, error, placeholder: "099 123 4567" })}</div>`;
}
export function insuranceContent(p, owner = false) {
  const ins = p.insurance;
  const parts = [
    ins.company ? `<h3>${h(ins.company)}</h3>` : "",
    ins.plan ? `<p>${h(ins.plan)}</p>` : "",
    owner && ins.member
      ? `<p class="private">Afiliación · ${h(ins.member)}</p>`
      : "",
    ins.phone
      ? `<a class="text-link" href="tel:${h(normalizePhone(ins.prefix, ins.phone))}">${icon("phone")} Llamar a asistencia</a>`
      : "",
  ].filter(Boolean);
  return parts.join("") || '<p class="muted">No proporcionado</p>';
}
export function textarea(label, name, value) {
  return `<div class="field"><label for="${name}">${h(label)}</label><textarea id="${name}" name="${name}" rows="3" maxlength="2000">${h(value)}</textarea></div>`;
}
export function profileContent(p, { owner = false, review = false } = {}) {
  return `<div class="identity"><h1>${h(p.firstName)}<br>${h(p.lastName)}</h1><div class="identity-meta"><span>${age(p.birthDate) ?? "—"} años</span><span>${h(new Date(p.birthDate + "T12:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" }))}</span></div><div class="blood"><span>Grupo sanguíneo</span><strong>${h(p.blood)}</strong></div></div><div class="profile-grid"><section class="card medical"><div class="section-title">${icon("heart")}<h2>Información médica</h2></div>${Object.entries(
    medicalFields,
  )
    .map(([k, label]) => {
      let m = p.medical[k];
      return `<div class="medical-row ${k === "allergies" && m.status === "provided" ? "allergy" : ""}"><h3>${h(label)}</h3><p>${
        m.status === "provided"
          ? m.items
              .filter((x) => x.trim())
              .map(h)
              .join("<br>")
          : h(statusLabels[m.status])
      }</p></div>`;
    })
    .join(
      "",
    )}</section><section class="card"><div class="section-title">${icon("phone")}<h2>Contactos de emergencia</h2></div>${p.contacts.map((c, i) => `<div class="contact"><div><small>${h(c.relation)} · ${i === 0 ? "Principal" : "Alternativo"}</small><h3>${h(c.name)}</h3><a class="number" href="tel:${h(normalizePhone(c.prefix, c.phone))}">${h(normalizePhone(c.prefix, c.phone))}</a></div><a class="call" href="tel:${h(normalizePhone(c.prefix, c.phone))}" aria-label="Llamar a ${h(c.name)}">${icon("phone")}</a></div>`).join("")}</section><section class="card"><div class="section-title">${icon("shield")}<h2>Seguro de salud</h2></div>${insuranceContent(p, owner)}</section><section class="card"><h2>Información adicional</h2>${
    [
      ["Instrucciones para emergencias", p.notes],
      ["Información complementaria", p.extra],
      ["Observaciones", p.observations],
    ]
      .filter(([, v]) => v)
      .map(
        ([l, v]) =>
          `<h3 class="note-label">${l}</h3><p class="prewrap">${h(v)}</p>`,
      )
      .join("") || '<p class="muted">No proporcionado</p>'
  }<div class="language"><span>Idioma preferido</span><strong>${h(p.language)}</strong></div></section></div>`;
}
