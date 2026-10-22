# Verificación del formulario reducido

Actualización: 22 de octubre de 2026.

Se mantienen el nombre del repositorio, la dirección base de GitHub Pages y las rutas anteriores. Se retiran los cinco pasos y se sustituyen por seis campos y la elección Acepto / No acepto, seguidos directamente por la ficha.

Las pruebas automatizadas cubren los seis campos, fechas imposibles o futuras, Banner de ocho dígitos con ceros iniciales, teléfonos, aceptación explícita, exclusión de campos retirados, migración de registros anteriores, conservación de identificadores, edición, fallos de almacenamiento y escape de texto.

La revisión de navegador debe comprobar formulario único, bloqueo al no aceptar, aceptación y generación inmediata de la ficha, enlace telefónico, edición y recarga, aviso y regreso, ausencia de secciones retiradas y adaptación a 320 y 390 píxeles sin desbordamiento.

No se realizan llamadas de prueba. Las pruebas del navegador integrado no equivalen a una certificación de Safari en un iPhone físico. No se ha integrado una base de datos, autenticación ni programación de etiquetas NFC.

El permiso obligatorio mantiene Generar ficha desactivado inicialmente y al seleccionar No acepto. Se comprobó la advertencia en pantalla a 390 píxeles y la habilitación al elegir Acepto.
