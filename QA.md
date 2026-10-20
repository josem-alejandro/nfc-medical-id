# Verificación de NFC Medical ID

Fecha: 20 de octubre de 2026.

## Comprobado

- Veinte pruebas automáticas de modelo, validación, teléfonos, proyección de consulta, persistencia y borrador separado de la ficha confirmada.
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

Repositorio nuevo: https://github.com/josem-alejandro/nfc-medical-id

Aplicación: https://josem-alejandro.github.io/nfc-medical-id/

GitHub Pages configurado mediante GitHub Actions. Respuesta HTTP 200 verificada. Las pruebas y la compilación se ejecutan antes de cada despliegue. Los recursos de producción incluyen una versión derivada del contenido para evitar mezclas de módulos en caché.

Se retiraron la marca TAPEC, la portada, la tarjeta «Explora una ficha», el pie de página y los textos auxiliares de la ficha a petición del usuario. La entrada abre directamente registro o la ficha confirmada de este navegador. Se conserva un solo aviso breve de demostración con datos ficticios.


## Actualización de facilidad de registro y privacidad

Se añadieron validaciones del Código Banner de ocho dígitos, teléfono internacional pegado, seguro parcialmente completado, aceptación por versión y exclusión de Banner de la consulta. Se incorporó `#/privacidad` con datos de TAPEC de ejemplo y referencias oficiales. La cabecera conserva solo «Demo». La revisión no constituye una certificación de cumplimiento legal.

## Navegación entre etapas

Los pasos visitados se pueden abrir directamente mediante los indicadores superiores o laterales, incluso desde la revisión. El formulario conserva el borrador, las correcciones y los pasos visitados al recargar. Los pasos aún no visitados se habilitan al avanzar mediante Continuar. Se mantiene Atrás y la validación del guardado final.
