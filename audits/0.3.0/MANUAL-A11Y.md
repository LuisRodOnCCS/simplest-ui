# Revisión manual con lector de pantalla

Esta revisión complementa las pruebas automáticas: no confirma la accesibilidad
por sí sola. La página usa el **código fuente de la copia local**, no el paquete
publicado. No introduzcas datos reales.

## Preparación

1. Desde la raíz del proyecto, ejecuta `npm install` si faltan dependencias y
   después `npm run docs:serve`.
2. Abre <http://127.0.0.1:5174/audits/0.3.0/manual-a11y.html>.
3. Activa NVDA y registra su versión, el navegador y su versión. Recomendado:
   NVDA con Firefox; repetir con Chrome si es posible. Mantén la configuración
   de verbosidad habitual y anota cualquier configuración relevante.
4. Navega con Tab y activa con Enter o Espacio. Si NVDA está en modo exploración,
   cambia a modo foco cuando sea necesario para interactuar con los controles.
   La formulación exacta puede variar; anota lo que realmente se escucha.

## 1. Avisos

1. Activa **Mostrar aviso en contenedor**. Espera unos segundos.
2. Anota si se escucha «Aviso en contenedor: cambios guardados», si se repite y
   si el foco permanece en el botón.
3. Activa **Limpiar avisos**, después **Mostrar aviso independiente**.
4. Anota si se escucha «Aviso independiente: conexión recuperada», si se repite
   y si el foco permanece en el botón. Limpia los avisos al terminar.

**Esperado:** cada mensaje se anuncia una vez, sin desplazar el foco. Si no se
anuncia o se anuncia varias veces, anota el resultado; no lo consideres aprobado.

## 2. Descripción y tooltip

1. Enfoca **Información de correo**. Escucha su nombre y su descripción.
2. Activa **Cambiar tooltip** y vuelve a enfocar **Información de correo**.
3. Escucha nuevamente. Usa **Restaurar tooltip inicial** para repetir.

**Esperado:** inicialmente se escucha la ayuda previa («el correo es
obligatorio») y el tooltip inicial («usa tu correo de trabajo»), sin duplicados.
Tras el cambio se conserva la ayuda previa y se escucha el tooltip actualizado
(«revisa el dominio de tu correo»), no el anterior. Se requiere volver a enfocar
el botón; no se exige un anuncio automático al cambiar el texto.

## 3. Diálogos anidados

1. Activa **Abrir panel lateral**. Comprueba que se anuncia el nombre «Panel
   lateral de prueba» y que el foco entra en él.
2. Dentro del panel, activa **Abrir diálogo interior**. Comprueba el nombre
   «Diálogo interior de prueba» y que el foco entra en el diálogo.
3. Pulsa Escape una vez: debe cerrarse únicamente el diálogo interior, el panel
   lateral debe permanecer abierto y el foco debe volver a **Abrir diálogo
   interior**.
4. Pulsa Escape otra vez: debe cerrarse el panel y el foco debe volver a
   **Abrir panel lateral**.

## Resultados

Copia y rellena por cada combinación de navegador y lector:

```text
Fecha:
Sistema operativo:
Navegador y versión:
NVDA y versión:
Configuración relevante:

Aviso en contenedor: aprobado / falló / no comprobado
Lo escuchado y número de anuncios:
Foco:

Aviso independiente: aprobado / falló / no comprobado
Lo escuchado y número de anuncios:
Foco:

Tooltip inicial: aprobado / falló / no comprobado
Lo escuchado:
Tooltip reemplazado: aprobado / falló / no comprobado
Lo escuchado:

Panel y diálogo: aprobado / falló / no comprobado
Nombres anunciados:
Primer Escape y foco:
Segundo Escape y foco:

Observaciones:
```
