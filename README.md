# NFC Medical ID

Demostración funcional de identificación médica mediante una URL NFC. Interfaz en español, móvil primero, con registro en cinco etapas, ficha de emergencia, edición, guardado local de progreso y enlaces telefónicos reales. No contiene datos médicos reales.

## Ejecutar

Node.js 22 o posterior. Sin dependencias externas ni instalación:

```sh
npm run dev
npm test
npm run build
npm run preview
```

Abrir http://127.0.0.1:5173. El servidor es solo para desarrollo; publicar `dist/` en un alojamiento estático.

## Arquitectura

Se eligen módulos JavaScript ES nativos y CSS moderno: esta demo estática no necesita un framework ni dependencias de producción. Mantiene componentes y límites separados sin coste de descarga adicional. Si se integra un backend, se puede migrar la capa de interfaz a React/TypeScript manteniendo el contrato del repositorio.

- `src/config.js`: número de emergencias, pasos e identificador ficticio.
- `src/model.js`: modelos mediante fábricas, validaciones, edad, teléfonos, proyección pública y escape de HTML.
- `src/storage.js`: adaptador `DemoRepository`, sustituible por una API autenticada.
- `src/ui.js`: campos, iconos y representación de la ficha.
- `src/forms.js`: contenido y campos de las cinco etapas.
- `src/privacy.js`: aceptación versionada y aviso de privacidad de ejemplo.
- `src/app.js`: rutas hash, registro, edición, revisión y guardado.
- `src/styles.css`: variables, superficies, responsive, foco y movimiento reducido.
- `tests/`: pruebas de validación, datos, persistencia y exclusión de información privada.

## Rutas

- `#/`: registro directo o ficha confirmada de este navegador.
- `#/registro`: registro o borrador.
- `#/privacidad`: aviso de privacidad de TAPEC con datos legales de ejemplo.
- `#/perfil/7d83b3c0-2a54-468c-9f21-03ce714fd028`: demostración ficticia disponible en cualquier dispositivo.
- `#/perfil/<UUID>`: ficha de prueba guardada en este navegador.
- `#/perfil/<UUID>/consulta`: proyección de consulta, sin afiliación.

La compilación añade una versión derivada del contenido a CSS y a todos los módulos JavaScript para evitar mezclar recursos de despliegues distintos en caché.

Las rutas hash y recursos relativos permiten acceso directo y actualización bajo `/nfc-medical-id/` en GitHub Pages sin una configuración de reescrituras. No hay datos personales en los identificadores. Los UUID se generan con `crypto.randomUUID()`.

## Publicar en GitHub Pages

1. Crear un repositorio nuevo `nfc-medical-id`, sin modificar otros repositorios.
2. Subir esta carpeta a la rama `main`.
3. En Settings → Pages → Build and deployment, seleccionar **GitHub Actions**.
4. Ejecutar el flujo `Validate and deploy Pages`. Las pruebas preceden al build y despliegue.
5. Verificar la URL que devuelve el flujo y abrir directamente la ruta de demostración, incluida una recarga.

URL publicada en GitHub Pages: `https://josem-alejandro.github.io/nfc-medical-id/`.

## Límites y datos sensibles

**Es una demostración, no un servicio médico operativo. Introducir únicamente datos ficticios.** No hay autenticación, backend, cifrado de registros, permisos reales ni sincronización. `localStorage` almacena el borrador y la ficha solo en ese navegador; cualquiera con acceso a ese navegador puede leerlos o editarlos. Los errores de almacenamiento se muestran y no se promete persistencia si está bloqueado. No se envían registros a un servidor ni se incorporan a la URL.

La proyección de consulta omite afiliación, código de pulsera y consentimiento. Esto es minimización visual, no un control de acceso: los datos locales siguen siendo accesibles al titular del navegador. El consentimiento final corresponde solo a la simulación con datos ficticios. El perfil fijo publicado usa nombres, aseguradora, condiciones y números de ejemplo. No llamar a los números ficticios. El botón de emergencias usa `tel:911` y abre el marcador; no inicia una llamada automáticamente. `config.emergencyNumber` permite configurar otro destino.

No introducir secretos ni datos reales en el código, repositorio, navegador de pruebas o GitHub Pages. No hay telemetría ni recursos de terceros. La política CSP bloquea scripts externos y objetos; no sustituye los controles de un backend.

## Integración futura segura y NFC

Antes de admitir información real se requiere un backend con autenticación del titular y administradores, autorización por registro, base de datos privada, cifrado en tránsito y reposo, auditoría, consentimiento granular, revocación, retención, eliminación y revisión de seguridad. La API pública debe devolver exclusivamente campos consentidos; la afiliación debe requerir autorización en servidor. Los errores públicos no deben revelar si existe un titular.

Sustituir `DemoRepository` por una API con métodos separados para borradores privados, actualizaciones autorizadas y consulta pública. Nunca enviar la ficha privada completa a un visitante para ocultar campos después. Separar el recurso de pulsera del perfil: identificador aleatorio, asignación, estado activo/desactivado, reasignación auditada y versión de consentimiento. El identificador no es una contraseña ni un mecanismo de autenticación.

La pulsera almacena únicamente una URL HTTPS de consulta. No se necesita Web NFC para abrir una URL grabada en una etiqueta NDEF. Esta versión no escribe etiquetas, asigna pulseras ni resuelve perfiles creados en otro dispositivo. Solo la URL fija de demostración puede grabarse y consultarse entre dispositivos. Una ficha local no es una URL NFC operativa.

## Verificación

Veinte pruebas automatizadas: renderizado de las cinco etapas y de la ficha, edad en límites del cumpleaños, identificadores, campos obligatorios, estados médicos, teléfonos, seguro opcional, datos privados, persistencia, errores y escape de entradas. Consultar `QA.md` para el alcance de la revisión manual y las limitaciones pendientes. No ejecutar llamadas reales durante las pruebas.

## Formulario y privacidad del prototipo

El Código Banner USFQ es un texto de exactamente ocho dígitos; conserva ceros iniciales y no se expone en la consulta pública. No se verifica contra sistemas de USFQ ni se afirma una relación institucional. Los códigos de pulsera anteriores no se reinterpretan como códigos Banner.

Los contactos y el teléfono de asistencia tienen Ecuador (+593) preseleccionado. También se pueden pegar números internacionales completos sin duplicar el prefijo. Todos los datos de seguro son independientes y opcionales, incluida aseguradora, plan, afiliación y teléfono.

La casilla de aceptación está desmarcada inicialmente y enlaza a `#/privacidad`; volver conserva el formulario. Los consentimientos de la versión anterior no sirven para aceptar el aviso nuevo. Al guardar se registra localmente la versión y fecha de la aceptación de ejemplo. Esto no es un registro probatorio de servidor ni autoriza tratar información médica real.

El aviso distingue almacenamiento local, alojamiento técnico y consulta mediante enlace NFC. Los datos legales de TAPEC se marcan «(ejemplo)» por petición del usuario. La cabecera muestra solo «Demo». Antes de un servicio real deben completarse los datos del responsable, habilitarse los mecanismos descritos y revisarse el tratamiento con asesoría competente; el documento no exonera responsabilidades.

Los indicadores de paso son botones: permiten volver directamente a cualquier etapa visitada y regresar después a otra ya abierta. El avance máximo se conserva al retroceder y recargar. No se valida ni bloquea una vuelta a un paso anterior; el guardado final sigue verificando los campos obligatorios. En móvil los cinco botones tienen un área táctil mínima de 44 × 44 px.
