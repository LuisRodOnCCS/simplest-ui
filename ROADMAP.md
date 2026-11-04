# Roadmap

El baseline `v0.1.0-rc.1` cubre tokens, estilos, layouts y los Web Components interactivos auditados. Este documento describe el trabajo posterior; no representa funcionalidades disponibles hasta que aparezcan en el changelog.

## P3 — Documentación e interoperabilidad

- [x] Publicar exports CSS separados: reset, base, componentes y bundle completo.
- [x] Ordenar el bundle completo con cascade layers `sui.reset`, `sui.base` y `sui.components`.
- [x] Explicar la convivencia con Bootstrap y Tailwind.
- [x] Convertir el ejemplo vanilla en catálogo visual navegable con tema claro, oscuro y de sistema.
- [x] Incluir manifiesto de componentes para documentación y agentes.
- [ ] Añadir importaciones CSS por componente cuando haya demanda real de reducción de CSS.
- [ ] Validar y documentar ejemplos de integración de Bootstrap 5 y Tailwind actuales.
- [ ] Convertir el drawer CSS en `<sui-drawer>` o declararlo como patrón CSS permanente.

## P4 — Agentes y automatización

- [x] Incluir una skill oficial para construir con Simplest UI.
- [ ] Evaluar la skill con prompts reales de reutilización, composición y creación de componentes.
- [ ] Publicar instrucciones de instalación para OpenCode, Claude Code y otros agentes compatibles.
- [ ] Generar documentación desde el manifiesto para eliminar duplicación manual.

## P5 — Calidad de release

- [ ] Añadir pruebas E2E en Chromium, Firefox y WebKit.
- [ ] Ejecutar auditorías de accesibilidad automatizadas con Axe.
- [ ] Incorporar pruebas visuales para temas y componentes.
- [ ] Documentar compatibilidad de navegador, SSR y React/Vue.
- [ ] Definir política de versionado y publicar `v0.1.0`.
- [ ] Desplegar el catálogo visual en GitHub Pages.

## Criterios para `v1.0.0`

- APIs públicas de Web Components estables y documentadas.
- Compatibilidad de integración probada.
- Guía SSR y de frameworks publicada.
- Accesibilidad y pruebas de navegador automatizadas.
- Política de deprecación y changelog establecidos.
