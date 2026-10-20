import { config } from "./config.js";
export function emptyProfile() {
  return {
    id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    birthDate: "",
    sex: "",
    blood: "Desconocido",
    band: "",
    medical: Object.fromEntries(
      ["conditions", "allergies", "medications", "instructions", "devices"].map(
        (k) => [k, { status: "unknown", items: [] }],
      ),
    ),
    contacts: [
      { name: "", relation: "", prefix: "+593", phone: "" },
      { name: "", relation: "", prefix: "+593", phone: "" },
    ],
    insurance: { company: "", plan: "", member: "", phone: "" },
    notes: "",
    extra: "",
    observations: "",
    language: "Español",
    consent: false,
    updatedAt: null,
  };
}
export function demoProfile() {
  let p = emptyProfile();
  return {
    ...p,
    id: config.demoId,
    firstName: "Elena",
    lastName: "Martínez",
    birthDate: "1992-04-18",
    blood: "O+",
    medical: {
      conditions: { status: "provided", items: ["Asma"] },
      allergies: { status: "provided", items: ["Penicilina"] },
      medications: {
        status: "provided",
        items: ["Medicación de ejemplo · sin pauta indicada"],
      },
      instructions: { status: "unknown", items: [] },
      devices: { status: "none", items: [] },
    },
    contacts: [
      {
        name: "Daniel Martínez (ejemplo)",
        relation: "Hermano",
        prefix: "+593",
        phone: "000000001",
      },
      {
        name: "Ana López (ejemplo)",
        relation: "Amiga",
        prefix: "+593",
        phone: "000000002",
      },
    ],
    insurance: {
      company: "Aseguradora de ejemplo",
      plan: "Cobertura de demostración",
      member: "DEMO-001",
      phone: "",
    },
    notes:
      "Información ficticia para explorar la experiencia. No utilizar como indicación médica.",
    updatedAt: "2026-10-20T12:00:00Z",
  };
}
export function age(date, now = new Date()) {
  let d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  let n = now.getFullYear() - d.getFullYear();
  return (
    n -
    (now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
      ? 1
      : 0)
  );
}
export function normalizePhone(prefix, phone) {
  let local = phone.replace(/[\s().-]/g, "");
  if (prefix === "+593") local = local.replace(/^0/, "");
  return prefix.replace(/\s/g, "") + local;
}
export function validPhone(value) {
  return /^\+[1-9]\d{6,14}$/.test(value);
}
export function validate(p, step) {
  let e = {};
  if (step === 0) {
    if (!p.firstName.trim()) e.firstName = "Escribe los nombres.";
    if (!p.lastName.trim()) e.lastName = "Escribe los apellidos.";
    let a = age(p.birthDate);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) ||
      a === null ||
      a < 0 ||
      a > 120 ||
      new Date(p.birthDate + "T00:00:00") > new Date()
    )
      e.birthDate = "Selecciona una fecha válida, hasta hoy.";
  }
  if (step === 1)
    for (let [k, v] of Object.entries(p.medical))
      if (v.status === "provided" && !v.items.some((x) => x.trim()))
        e[k] = "Agrega al menos un registro o cambia la opción.";
  if (step === 2)
    p.contacts.forEach((c, i) => {
      if (!c.name.trim())
        e[`contact-${i}-name`] = "Escribe el nombre del contacto.";
      if (!c.relation.trim())
        e[`contact-${i}-relation`] = "Indica la relación.";
      if (!validPhone(normalizePhone(c.prefix, c.phone)))
        e[`contact-${i}-phone`] =
          "Usa un prefijo internacional y un número válido (7–15 dígitos en total).";
    });
  if (step === 3) {
    if (
      Object.values(p.insurance).some((x) => x.trim()) &&
      !p.insurance.company.trim()
    )
      e.company = "Indica la aseguradora o deja la sección vacía.";
    if (
      p.insurance.phone &&
      !validPhone(p.insurance.phone.replace(/[\s()-]/g, ""))
    )
      e.insurancePhone =
        "Usa formato internacional, por ejemplo +593 seguido del número.";
  }
  return e;
}
export function publicProfile(p) {
  let {
    id,
    firstName,
    lastName,
    birthDate,
    blood,
    medical,
    contacts,
    notes,
    extra,
    observations,
    language,
    updatedAt,
  } = p;
  return {
    id,
    firstName,
    lastName,
    birthDate,
    blood,
    medical,
    contacts,
    notes,
    extra,
    observations,
    language,
    updatedAt,
    insurance: {
      company: p.insurance.company,
      plan: p.insurance.plan,
      phone: p.insurance.phone,
    },
  };
}
export function escapeHtml(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
