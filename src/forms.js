import { bloodGroups } from "./config.js";
import { ageDescription } from "./model.js";
import { field, bloodField } from "./ui.js";
export function registrationFields(profile, errors = {}) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return `<div class="fields-grid">${field("Nombre", "firstName", profile.firstName, { error: errors.firstName, autocomplete: "given-name" })}${field("Apellido", "lastName", profile.lastName, { error: errors.lastName, autocomplete: "family-name" })}${field("Fecha de nacimiento", "birthDate", profile.birthDate, { type: "date", max: today, error: errors.birthDate, hint: ageDescription(profile.birthDate) || "La edad se calcula automáticamente." })}${bloodField(profile.blood, bloodGroups, errors.blood)}${field("Código Banner", "banner", profile.banner, { error: errors.banner, maxlength: 8, inputmode: "numeric", pattern: "[0-9]{8}", placeholder: "00000000" })}${field("Teléfono de emergencia", "emergencyPhone", profile.emergencyPhone, { type: "tel", inputmode: "tel", error: errors.emergencyPhone, placeholder: "099 123 4567", hint: "Ecuador (+593) predeterminado." })}</div>`;
}
