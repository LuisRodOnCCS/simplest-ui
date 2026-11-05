# Support

This document defines what Simplest UI supports for the `0.1.0` release line. It covers browsers, environments, server-side rendering, and accessibility targets.

## Browsers

| Engine | Supported versions |
| --- | --- |
| Chromium | Chrome and Edge, last two versions. |
| Gecko | Firefox, last two versions. |
| WebKit | Safari, last two versions on macOS and iOS. |
| Mobile | Chrome Android and Safari iOS through their current engines. |

"Last two versions" follows each vendor's current stable channel. Internet Explorer and legacy Edge are not supported.

Layouts are validated responsively from `320px` upward. Touch devices keep their native scrolling and form behavior.

## Environments

| Environment | Status | Notes |
| --- | --- | --- |
| Vanilla HTML and JavaScript | Supported | Native ES modules and package CSS imports. |
| Laravel Blade with Vite | Supported | Import the package from `resources/js` and `resources/css`. |
| Any bundler resolving package exports | Supported | The package ships ES modules and plain CSS files. |
| React, Vue, and other frameworks | Not validated | Supported in a future release; see the roadmap. |

Node.js `>=18` is required for build tooling. Simplest UI itself runs in the browser and has no Node.js runtime requirement.

## Server-side rendering

CSS is plain and can be loaded during server rendering. Web Components must be imported in a client bundle because they register through `customElements` and use `window` and `document`.

```ts
// Server bundle: styles only.
import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/components/button.css";

// Client bundle: interactive elements.
import "@luisrodonccs/simplest-ui/components/drawer";
```

Web Components have no hydration contract. They render when the browser upgrades the custom element, so server-rendered markup must provide meaningful fallback content.

## Accessibility

The target is WCAG 2.2 AA. Interactive components ship keyboard behavior, ARIA relationships, visible focus, and reduced-motion support.

Automated Axe audits must report no `critical` or `serious` violations before a release. Automated checks do not replace manual keyboard and screen reader review.

## Out of scope for `0.1.0`

- React and Vue adapters or validated integration guides.
- Validated Bootstrap 5 and Tailwind integration examples.
- Internet Explorer and legacy Edge.
- Right-to-left layout validation.

## Version support

Simplest UI follows Semantic Versioning. Before `1.0.0`, minor versions may include breaking changes; the changelog documents them. Only the latest published version receives fixes.
