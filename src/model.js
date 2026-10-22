import { config, bloodGroups } from "./config.js";
const text = (value) => (typeof value === "string" ? value.slice(0, 180) : "");
export function emptyProfile() {
  return {
    id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    birthDate: "",
    blood: "Desconocido",
    banner: "",
    emergencyPhone: "",
    consentChoice: "",
    consentVersion: null,
    consentRecord: null,
    updatedAt: null,
  };
}
// Whitelist the reduced schema. Historical medical/insurance/contact details are not retained.
export function cleanProfile(source) {
  if (!source || typeof source !== "object") return null;
  const p = emptyProfile();
  if (typeof source.id === "string" && /^[a-f0-9-]{36}$/i.test(source.id))
    p.id = source.id;
  for (const key of ["firstName", "lastName", "birthDate", "banner"])
    p[key] = text(source[key]);
  p.blood = bloodGroups.includes(source.blood) ? source.blood : "Desconocido";
  const previousContact = source.contacts?.[0];
  p.emergencyPhone =
    text(source.emergencyPhone) ||
    (previousContact?.phone
      ? normalizePhone(
          text(previousContact.phone),
          text(previousContact.prefix) || config.defaultPrefix,
        )
      : "");
  p.consentChoice = ["accept", "decline"].includes(source.consentChoice)
    ? source.consentChoice
    : "";
  p.consentVersion =
    source.consentVersion === config.privacyVersion
      ? config.privacyVersion
      : null;
  if (
    p.consentChoice === "accept" &&
    p.consentVersion &&
    typeof source.consentRecord?.acceptedAt === "string"
  )
    p.consentRecord = {
      version: config.privacyVersion,
      acceptedAt: source.consentRecord.acceptedAt,
      mode: "demo",
    };
  p.updatedAt = typeof source.updatedAt === "string" ? source.updatedAt : null;
  return p;
}
export function demoProfile() {
  return {
    ...emptyProfile(),
    id: config.demoId,
    firstName: "Elena",
    lastName: "Martínez",
    birthDate: "1992-04-18",
    blood: "O+",
    banner: "00000000",
    emergencyPhone: "000000001",
  };
}
export function normalizePhone(value, prefix = config.defaultPrefix) {
  let phone = String(value || "").replace(/[\s().-]/g, "");
  if (phone.startsWith("+")) return phone;
  const country = prefix || config.defaultPrefix;
  if (country === "+593") phone = phone.replace(/^0/, "");
  return country + phone;
}
export function validPhone(value) {
  return /^\+[1-9]\d{6,14}$/.test(value);
}
export function validate(p, now = new Date()) {
  const errors = {};
  if (!p.firstName.trim()) errors.firstName = "Escribe el nombre.";
  if (!p.lastName.trim()) errors.lastName = "Escribe el apellido.";
  const date = new Date(p.birthDate + "T12:00:00");
  const [year, month, day] = p.birthDate.split("-").map(Number);
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) ||
    !Number.isFinite(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day ||
    date > today ||
    year < now.getFullYear() - 120
  )
    errors.birthDate = "Selecciona una fecha de nacimiento válida, hasta hoy.";
  if (!bloodGroups.includes(p.blood))
    errors.blood = "Selecciona un grupo sanguíneo o Desconocido.";
  if (!/^\d{8}$/.test(p.banner))
    errors.banner = "El Código Banner debe tener exactamente 8 dígitos.";
  if (!p.emergencyPhone.trim() || !validPhone(normalizePhone(p.emergencyPhone)))
    errors.emergencyPhone =
      "Escribe un teléfono válido. +593 se agrega automáticamente.";
  return errors;
}
export function validateConsent(p) {
  return (
    p.consentChoice === "accept" && p.consentVersion === config.privacyVersion
  );
}
export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

// Derived on every render; never stored, so it stays current after birthdays.
export function calculateAge(birthDate, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || "")) return null;
  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  )
    return null;
  let years = now.getFullYear() - year;
  if (
    now.getMonth() < month - 1 ||
    (now.getMonth() === month - 1 && now.getDate() < day)
  )
    years--;
  return years >= 0 && years <= 120 ? years : null;
}
export function ageDescription(birthDate, now = new Date()) {
  const years = calculateAge(birthDate, now);
  return years === null ? "" : `${years} ${years === 1 ? "año" : "años"}`;
}
