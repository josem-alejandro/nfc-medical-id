# NFC Medical ID

Prototipo de identificación médica con un formulario único y una ficha compacta, optimizados para celular.

**La dirección no cambia:** https://josem-alejandro.github.io/nfc-medical-id/

Las URL ya grabadas en etiquetas NFC siguen apuntando al mismo repositorio y alojamiento. Se conservan las rutas anteriores `#/registro`, `#/perfil/<UUID>` y `#/perfil/<UUID>/consulta`, además del perfil fijo de demostración. Los parámetros `?v=` de enlaces anteriores no modifican el funcionamiento.

## Datos solicitados

Solo nombre, apellido, fecha de nacimiento, grupo sanguíneo, Código Banner de ocho dígitos y un teléfono de emergencia. El número utiliza +593 por defecto y acepta números internacionales completos. El permiso de tratamiento ofrece «Acepto» y «No acepto», sin elección preseleccionada; únicamente Acepto permite guardar y abrir la ficha.

La ficha presenta esos seis datos y un enlace `tel:` al contacto. No se solicitan ni se muestran sexo, enfermedades, alergias, medicamentos, dispositivos, seguros, múltiples contactos, notas, idioma ni edad calculada. El Código Banner se muestra en la ficha; no debe interpretarse como un dato privado oculto a los visitantes de esa vista.

## Desarrollo

Node.js 22 o posterior. Sin dependencias de producción ni instalación.

```sh
npm run dev
npm test
npm run build
npm run preview
```

Abrir http://127.0.0.1:5173. Publicar `dist/` en GitHub Pages. El flujo `Validate and deploy Pages` ejecuta las pruebas, compila y publica los cambios de `main`. Los recursos reciben una versión derivada de su contenido para evitar mezclar módulos antiguos y nuevos en caché.

## Organización

- `src/config.js`: prefijo por defecto, identificador de demostración y versión del aviso.
- `src/model.js`: esquema reducido, normalización, validación y migración por lista de campos permitidos.
- `src/storage.js`: persistencia local y migración de los registros anteriores.
- `src/forms.js`: los seis campos del formulario.
- `src/ui.js`: componentes y ficha.
- `src/privacy.js`: permiso y aviso de privacidad de ejemplo.
- `src/app.js`: navegación, guardado y edición.
- `src/styles.css`: diseño responsive, foco, transiciones y movimiento reducido.

## Prototipo y migración

Usar únicamente información ficticia. No hay backend, autenticación, sincronización entre dispositivos ni controles de autorización de servidor. Esta versión no escribe ni asigna pulseras. La ficha fija de demostración es accesible desde distintos dispositivos; las fichas creadas por el usuario solo existen en el navegador donde se guardaron.

Los cambios del formulario se conservan en memoria durante la pestaña, incluso al consultar el aviso y regresar. Solo se guardan al aceptar y pulsar «Generar ficha». Rechazar no genera ni guarda una ficha nueva y no borra otra previamente confirmada.

Se mantiene la clave local histórica para migrar los registros existentes. La migración conserva los identificadores, los seis datos permitidos y el primer teléfono anterior; retira de los registros los campos ya eliminados. Las aceptaciones anteriores no se reutilizan para aceptar el aviso nuevo. Si el navegador bloquea las escrituras, la aplicación informa de que la ficha no se pudo guardar.

El aviso de TAPEC usa datos legales marcados como ejemplo. No acredita cumplimiento normativo ni exime responsabilidades. Antes de tratar información real se requiere un backend privado, permisos, medidas verificadas, plazos y atención de derechos operativos. El identificador aleatorio de una ficha no sustituye la autenticación.

El permiso se identifica como obligatorio. «Generar ficha» está desactivado hasta elegir «Acepto». Al seleccionar «No acepto», se muestra una advertencia accesible dentro de la pantalla. Se incluyen transiciones breves de entrada, foco y selección, con soporte de reducción de movimiento.
