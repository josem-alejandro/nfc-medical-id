# Verificación de NFC Medical ID

Fecha: 20 de octubre de 2026.

## Comprobado

- Once pruebas automáticas de modelo, validación, teléfonos, proyección de consulta, persistencia y borrador separado de la ficha confirmada.
- Compilación de producción con validación de sintaxis de todos los módulos fuente.
- Recorrido manual completo en navegador: cinco etapas, campos obligatorios, selección de sangre, dos alergias, dos contactos, seguro omitido, notas, revisión, consentimiento y ficha generada.
- Coincidencia de nombre, fecha, edad, sangre, alergias, estados desconocido/no presenta, contactos y notas entre registro y ficha.
- Recarga de la ficha y recuperación de los datos persistidos.
- Edición del nombre y aseguradora, nuevo guardado y actualización de la ficha sin pérdida del resto de información.
- Número de afiliación visible en la vista local del titular y ausente de la vista de consulta.
- Enlaces `tel:` de contactos normalizados y botón principal `tel:911`. No se realizaron llamadas.
- Diseño revisado a 320, 390 y 1440 píxeles. Sin desbordamiento horizontal en los tamaños móviles revisados.
- Orden visual y de lectura: información médica, contactos, seguro e información adicional.
- Las rutas desconocidas no muestran datos de otro perfil.
- Texto negro sobre el rojo principal del botón de emergencias para contraste de al menos 4.5:1; controles principales blancos sobre el rojo secundario.

## Alcance y límites

Revisión realizada con el navegador integrado del entorno. No equivale a una prueba sobre un iPhone físico ni certifica Safari móvil, VoiceOver, Android o todas las combinaciones de tecnologías de asistencia. La interfaz incluye safe areas, entradas nativas, foco visible y reducción de movimiento; se recomienda una revisión en dispositivos reales antes de producción.

No se ha integrado un backend ni etiquetas NFC físicas. La ficha ficticia fija puede abrirse entre dispositivos; los registros creados con el formulario solo existen en el navegador que los guardó. La separación de vistas no es autenticación ni autorización de servidor.

## Publicación

El resultado del despliegue público y la última revisión de consola se documentarán al finalizar la publicación en GitHub Pages.
