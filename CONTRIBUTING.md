# Contribuir a Simplest UI

## Principios

1. Reutiliza primero un componente, clase o token existente.
2. Conserva los prefijos: `sui-` para Custom Elements y tokens, `ui-` para clases CSS.
3. Usa HTML semántico antes de crear una etiqueta personalizada.
4. Crea un Web Component solo si aporta estado, interacción o comportamiento accesible reutilizable.
5. Mantén los componentes como fuente de verdad: la documentación y los ejemplos los deben consumir, no reimplementar.

## Checklist de un cambio

- [ ] Revisa `components.manifest.json` y el catálogo visual antes de crear algo nuevo.
- [ ] Usa tokens `--sui-*`; no incorpores valores visuales arbitrarios si existe un token adecuado.
- [ ] Incluye estados de foco, teclado, `prefers-reduced-motion` y semántica/ARIA cuando corresponda.
- [ ] Para Web Components, documenta atributos, slots, eventos, métodos y relación de foco.
- [ ] Añade pruebas unitarias de comportamiento y actualiza las declaraciones JSX si aplica.
- [ ] Añade una muestra al catálogo visual y actualiza el manifiesto.
- [ ] Ejecuta `npm run typecheck`, `npm test`, `npm run build` y `npm pack --dry-run`.

## Pull requests

Trabaja desde `dev` en una rama `feat/*`, `fix/*` o `docs/*`. Los cambios entran primero en `dev`; solo releases verificadas pasan a `main`.
