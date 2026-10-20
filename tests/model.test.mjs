import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyProfile,
  demoProfile,
  age,
  normalizePhone,
  validate,
  publicProfile,
  escapeHtml,
} from "../src/model.js";
import { DemoRepository } from "../src/storage.js";
test("edad antes, durante y después del cumpleaños", () => {
  assert.equal(age("1992-04-18", new Date(2026, 3, 17)), 33);
  assert.equal(age("1992-04-18", new Date(2026, 3, 18)), 34);
  assert.equal(age("1992-04-18", new Date(2026, 3, 19)), 34);
});
test("identificadores aleatorios y estados médicos explícitos", () => {
  let p = emptyProfile();
  assert.notEqual(p.id, emptyProfile().id);
  assert.ok(Object.values(p.medical).every((v) => v.status === "unknown"));
});
test("no permite identificación incompleta ni fechas futuras", () => {
  assert.equal(Object.keys(validate(emptyProfile(), 0)).length, 3);
  let p = demoProfile();
  p.birthDate = "2999-01-01";
  assert.ok(validate(p, 0).birthDate);
});
test("números ecuatorianos normalizados y prefijos internacionales", () => {
  assert.equal(normalizePhone("+593", "099 123 4567"), "+593991234567");
  assert.equal(normalizePhone("+1", "202-555-0146"), "+12025550146");
  let p = demoProfile();
  p.contacts[0].phone = "abc";
  assert.ok(validate(p, 2)["contact-0-phone"]);
});
test("rechaza estado agregar información sin registros", () => {
  let p = demoProfile();
  p.medical.allergies.items = [" "];
  assert.ok(validate(p, 1).allergies);
  p.medical.allergies.status = "none";
  assert.ok(!validate(p, 1).allergies);
});
test("seguro opcional y teléfono internacional", () => {
  assert.deepEqual(validate(emptyProfile(), 3), {});
  let p = emptyProfile();
  p.insurance.plan = "Plan";
  assert.ok(validate(p, 3).company);
  p.insurance.phone = "0999";
  assert.ok(validate(p, 3).insurancePhone);
});
test("consulta excluye datos privados del titular", () => {
  let p = demoProfile();
  let view = publicProfile(p);
  assert.ok(!("member" in view.insurance));
  assert.ok(!("band" in view));
  assert.ok(!("consent" in view));
});
test("guardado, edición y recuperación de borrador", () => {
  let value = null;
  let repo = new DemoRepository({
    getItem: () => value,
    setItem: (_, v) => (value = v),
  });
  let p = demoProfile();
  assert.equal(repo.save(p, 3, true), true);
  assert.equal(repo.read().profile.firstName, "Elena");
  p.firstName = "Lucía";
  repo.save(p, 4, true);
  assert.equal(repo.read().profile.firstName, "Lucía");
  assert.equal(repo.read().step, 4);
});
test("fallos de almacenamiento y contenido corrupto", () => {
  let repo = new DemoRepository({
    getItem: () => "{broken",
    setItem: () => {
      throw Error();
    },
  });
  assert.equal(repo.read(), null);
  assert.equal(repo.save(demoProfile()), false);
});
test("escapa texto introducido para impedir HTML ejecutable", () => {
  assert.equal(
    escapeHtml('<img onerror="x">'),
    "&lt;img onerror=&quot;x&quot;&gt;",
  );
});

test("borradores de edición no sustituyen la ficha confirmada", () => {
  let value = null;
  let repo = new DemoRepository({
    getItem: () => value,
    setItem: (_, v) => (value = v),
  });
  let p = demoProfile();
  repo.save(p, 0, true);
  p.firstName = "Borrador";
  repo.save(p, 1, false);
  assert.equal(repo.read().profile.firstName, "Borrador");
  assert.equal(repo.read().publishedProfile.firstName, "Elena");
  repo.save(p, 4, true);
  assert.equal(repo.read().publishedProfile.firstName, "Borrador");
});

import { stage } from "../src/forms.js";
import { profileContent } from "../src/ui.js";
test("las cinco etapas se renderizan sin referencias ausentes", () => {
  let p = demoProfile();
  for (let i = 0; i < 5; i++) assert.ok(stage(i, p, {}).length > 0);
});
test("la ficha renderizada contiene llamadas y excluye afiliación en consulta", () => {
  let p = demoProfile();
  let html = profileContent(publicProfile(p));
  assert.ok(html.includes('href="tel:'));
  assert.ok(!html.includes("DEMO-001"));
  assert.ok(!html.includes("TAPEC"));
});
