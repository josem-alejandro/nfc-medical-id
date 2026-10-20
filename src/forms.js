import { medicalFields, statusLabels } from "./config.js";
import { escapeHtml as h } from "./model.js";
import { icon, field, select, textarea } from "./ui.js";
const today = () => new Date().toLocaleDateString("en-CA");
export function stage(step, draft, errors) {
  if (step === 0)
    return `<div class="fields-grid">${field("Nombres", "firstName", draft.firstName, { required: true, autocomplete: "given-name", error: errors.firstName })}${field("Apellidos", "lastName", draft.lastName, { required: true, autocomplete: "family-name", error: errors.lastName })}${field("Fecha de nacimiento", "birthDate", draft.birthDate, { type: "date", max: today(), required: true, error: errors.birthDate })}${select("Grupo sanguíneo", "blood", draft.blood, ["Desconocido", "O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−"])}${select("Sexo · opcional", "sex", draft.sex, [["", "No proporcionar"], "Femenino", "Masculino", "Intersexual"])}${field("Código de pulsera · opcional", "band", draft.band)}</div><p class="fine">La edad se calculará automáticamente a partir de la fecha de nacimiento.</p>`;
  if (step === 1)
    return Object.entries(medicalFields)
      .map(
        ([key, label]) =>
          `<fieldset class="medical-input"><legend>${label}</legend>${select("Estado de la información", `medical-${key}`, draft.medical[key].status, Object.entries(statusLabels))}${draft.medical[key].status === "provided" ? `<div class="records">${draft.medical[key].items.map((v, i) => `<div class="record">${field(`Registro ${i + 1}`, `record-${key}-${i}`, v)}<button type="button" class="remove" data-remove="${key}:${i}" aria-label="Eliminar registro ${i + 1} de ${label}">×</button></div>`).join("")}<button class="text-link" type="button" data-add="${key}">${icon("plus")} Agregar registro</button></div>` : ""}<p class="error">${h(errors[key] || "")}</p></fieldset>`,
      )
      .join("");
  if (step === 2)
    return `<p class="fine intro">Registra dos contactos. Se mostrarán en la ficha de emergencia.</p>${draft.contacts.map((c, i) => `<fieldset class="contact-input"><legend>Contacto ${i + 1} <span>${i === 0 ? "Principal" : "Alternativo"}</span></legend><div class="fields-grid">${field("Nombre completo", `contact-${i}-name`, c.name, { required: true, error: errors[`contact-${i}-name`] })}${field("Relación", `contact-${i}-relation`, c.relation, { required: true, error: errors[`contact-${i}-relation`] })}<div class="phone-fields">${field("Prefijo", `contact-${i}-prefix`, c.prefix, { type: "tel" })}${field("Número telefónico", `contact-${i}-phone`, c.phone, { type: "tel", required: true, error: errors[`contact-${i}-phone`] })}</div></div></fieldset>`).join("")}`;
  if (step === 3)
    return `<p class="fine intro">Esta etapa es opcional. Puedes continuar sin completarla.</p><div class="fields-grid">${field("Aseguradora", "company", draft.insurance.company, { error: errors.company })}${field("Plan o cobertura", "plan", draft.insurance.plan)}${field("Número de afiliación", "member", draft.insurance.member)}${field("Teléfono de asistencia · opcional", "insurancePhone", draft.insurance.phone, { type: "tel", error: errors.insurancePhone, placeholder: "+593…" })}</div><div class="inline-note">${icon("shield")}<p>La afiliación se excluye de la vista de consulta. La demo no tiene autenticación; no introduzcas datos reales.</p></div>`;
  return `${textarea("Instrucciones para emergencias", "notes", draft.notes)}${textarea("Información complementaria", "extra", draft.extra)}${textarea("Observaciones", "observations", draft.observations)}${field("Idioma preferido", "language", draft.language)}<div class="inline-note">${icon("signal")}<p>Tu ficha de prueba se podrá consultar únicamente en este navegador. Esta versión no permite asignar pulseras reales.</p></div>`;
}
