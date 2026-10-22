import { test } from "node:test";
import assert from "node:assert/strict";
import { config } from "../src/config.js";
import {
  emptyProfile,
  demoProfile,
  cleanProfile,
  normalizePhone,
  validate,
  validateConsent,
  escapeHtml,
} from "../src/model.js";
import { DemoRepository } from "../src/storage.js";
import { registrationFields } from "../src/forms.js";
import { profileContent } from "../src/ui.js";
import { consentMarkup, privacyPage } from "../src/privacy.js";
test("los seis campos permiten generar una ficha válida", () => {
  assert.deepEqual(validate(demoProfile()), {});
  assert.equal(Object.keys(validate(emptyProfile())).length, 5);
});
test("Banner conserva ceros iniciales y exige ocho dígitos", () => {
  const p = demoProfile();
  for (const value of ["", "1234567", "123456789", "abcdefgh"]) {
    p.banner = value;
    assert.ok(validate(p).banner);
  }
  p.banner = "00123456";
  assert.ok(!validate(p).banner);
});
test("fecha inválida, futura o imposible no se acepta", () => {
  const p = demoProfile();
  for (const value of ["", "2999-01-01", "2001-02-29", "2026-02-31"]) {
    p.birthDate = value;
    assert.ok(validate(p).birthDate);
  }
  p.birthDate = "2000-02-29";
  assert.ok(!validate(p).birthDate);
});
test("Ecuador se añade por defecto y teléfonos internacionales no se duplican", () => {
  assert.equal(normalizePhone("099 123 4567"), "+593991234567");
  assert.equal(normalizePhone("+1 (202) 555-0146"), "+12025550146");
  const p = demoProfile();
  p.emergencyPhone = "abc";
  assert.ok(validate(p).emergencyPhone);
});
test("aceptación exige elección afirmativa y versión vigente", () => {
  const p = demoProfile();
  assert.equal(validateConsent(p), false);
  p.consentChoice = "decline";
  p.consentVersion = config.privacyVersion;
  assert.equal(validateConsent(p), false);
  p.consentChoice = "accept";
  assert.equal(validateConsent(p), true);
  p.consentVersion = "old";
  assert.equal(validateConsent(p), false);
});
test("formulario contiene exactamente los seis datos y no hay campos retirados", () => {
  const html = registrationFields(emptyProfile());
  assert.deepEqual(
    [...html.matchAll(/name="([^"]+)"/g)].map((m) => m[1]),
    ["firstName", "lastName", "birthDate", "blood", "banner", "emergencyPhone"],
  );
  const consent = consentMarkup();
  assert.ok(!consent.includes("checked"));
  assert.ok(consent.includes("No acepto"));
  assert.ok(consent.includes("#/privacidad"));
});
test("ficha muestra Banner, teléfono correcto y no conserva secciones retiradas", () => {
  const p = demoProfile();
  const html = profileContent(p);
  assert.ok(html.includes("00000000"));
  assert.ok(html.includes(`tel:${normalizePhone(p.emergencyPhone)}`));
  for (const label of [
    "Alergias",
    "Medicamentos",
    "Seguro de salud",
    "Información adicional",
    "911",
  ])
    assert.ok(!html.includes(label));
});
test("migración mantiene identificador y datos permitidos, retira los demás", () => {
  const p = demoProfile();
  const old = {
    ...p,
    emergencyPhone: undefined,
    contacts: [
      {
        name: "No debe persistir",
        relation: "Amigo",
        prefix: "+593",
        phone: "0991234567",
      },
    ],
    medical: { allergies: "No debe persistir" },
    insurance: { member: "No debe persistir" },
    notes: "No debe persistir",
    sex: "No debe persistir",
  };
  const clean = cleanProfile(old);
  assert.equal(clean.id, p.id);
  assert.equal(clean.emergencyPhone, "+593991234567");
  for (const key of ["contacts", "medical", "insurance", "notes", "sex"])
    assert.ok(!(key in clean));
});
test("repositorio migra versión anterior sin romper la URL y purga campos retirados", () => {
  const p = demoProfile();
  let stored = JSON.stringify({
    version: 1,
    profile: {
      ...p,
      medical: { allergies: ["RETIRADO"] },
      insurance: { member: "RETIRADO" },
      contacts: [],
    },
    publishedProfile: { ...p, notes: "RETIRADO" },
    step: 4,
    furthestStep: 4,
  });
  const repo = new DemoRepository({
    getItem: () => stored,
    setItem: (_, value) => (stored = value),
  });
  const result = repo.read();
  assert.equal(result.version, 2);
  assert.equal(result.publishedProfile.id, p.id);
  assert.ok(!stored.includes("RETIRADO"));
  assert.ok(!stored.includes("furthestStep"));
});
test("guardado y edición conservan exclusivamente los datos solicitados", () => {
  let stored = null;
  const repo = new DemoRepository({
    getItem: () => stored,
    setItem: (_, value) => (stored = value),
  });
  const p = demoProfile();
  assert.equal(repo.save(p), true);
  p.firstName = "Nombre modificado";
  p.notes = "RETIRADO";
  repo.save(p);
  assert.equal(repo.read().publishedProfile.firstName, "Nombre modificado");
  assert.ok(!stored.includes("RETIRADO"));
});
test("fallos de almacenamiento no producen excepciones", () => {
  const repo = new DemoRepository({
    getItem: () => "{broken",
    setItem: () => {
      throw Error();
    },
  });
  assert.equal(repo.read(), null);
  assert.equal(repo.save(demoProfile()), false);
});
test("texto introducido se escapa y aviso describe el esquema reducido", () => {
  assert.equal(escapeHtml("<script>"), "&lt;script&gt;");
  const p = demoProfile();
  p.firstName = "<script>alert(1)</script>";
  assert.ok(!profileContent(p).includes("<script>"));
  assert.ok(privacyPage().includes("seis datos"));
  assert.ok(privacyPage().includes("TAPEC (ejemplo)"));
});

test("rechazo presenta advertencia y el permiso se marca obligatorio", () => {
  const html = consentMarkup("decline");
  assert.ok(html.includes("Obligatorio"));
  assert.ok(
    html.includes(
      "Tu ficha no se podrá generar si no aceptas la política de privacidad.",
    ),
  );
  assert.ok(html.includes('role="alert"'));
});
