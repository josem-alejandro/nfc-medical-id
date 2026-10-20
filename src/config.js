export const config = Object.freeze({
  privacyVersion: "2026-10-20-demo-1",
  emergencyNumber: "911",
  defaultPrefix: "+593",
  storageKey: "tapec.demo.v1",
  demoId: "7d83b3c0-2a54-468c-9f21-03ce714fd028",
});
export const steps = [
  "Identificación",
  "Información médica",
  "Contactos",
  "Seguro de salud",
  "Revisión final",
];
export const medicalFields = {
  conditions: "Condiciones médicas",
  allergies: "Alergias",
  medications: "Medicamentos permanentes",
  instructions: "Indicaciones médicas especiales",
  devices: "Dispositivos implantados",
};
export const statusLabels = {
  unknown: "Desconocido",
  none: "No presenta",
  withheld: "Prefiero no proporcionar",
  provided: "Agregar información",
};
