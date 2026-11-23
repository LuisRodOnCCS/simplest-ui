import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../components.manifest.json";
import * as components from "../src/components/index";

type LitPropertyOptions = {
  attribute?: string | boolean;
  reflect?: boolean;
};

type WebComponentConstructor = CustomElementConstructor & {
  observedAttributes?: string[];
  elementProperties?: Map<string, LitPropertyOptions>;
};

type WebComponentEntry = {
  tag: string;
  className: string;
  import: string;
  attributes: string[];
  properties: Record<string, string>;
  slots: string[];
  events: string[];
  eventDetails?: Record<string, string>;
};

const entries = manifest.webComponents as WebComponentEntry[];
const exportedComponents = components as unknown as Record<string, WebComponentConstructor | undefined>;
const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as {
  name: string;
  exports: Record<string, unknown>;
};

const kebabCase = (value: string) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function descriptorFor(ctor: WebComponentConstructor, name: string) {
  let proto: object | null = ctor.prototype;
  while (proto) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, name);
    if (descriptor) return descriptor;
    proto = Object.getPrototypeOf(proto) as object | null;
  }
  return undefined;
}

function sampleFor(type: string): string | number | boolean {
  if (type === "boolean") return true;
  if (type === "number") return 1500;
  const quoted = [...type.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);
  return quoted.find((value) => value !== "default") ?? quoted[0] ?? "contract-value";
}

describe("manifest ↔ runtime contract", () => {
  it("exports and registers every documented custom element", () => {
    for (const entry of entries) {
      const ctor = exportedComponents[entry.className];
      expect(ctor, `${entry.tag} must export ${entry.className}`).toBeTypeOf("function");
      expect(customElements.get(entry.tag), `${entry.tag} must be registered`).toBe(ctor);
    }
  });

  it("resolves every documented import to a package export", () => {
    for (const entry of entries) {
      const subpath = entry.import.replace(`${packageJson.name}/`, "./");
      expect(subpath, `${entry.tag} import`).not.toBe(entry.import);
      expect(packageJson.exports[subpath], `${entry.tag} import ${entry.import}`).toBeDefined();
    }
  });

  it("observes every documented attribute", () => {
    for (const entry of entries) {
      const ctor = exportedComponents[entry.className]!;
      const observed = new Set(ctor.observedAttributes ?? []);
      for (const attribute of entry.attributes) {
        expect(observed.has(attribute), `${entry.tag} must observe [${attribute}]`).toBe(true);
      }
    }
  });

  it("exposes every documented property as a writable accessor", () => {
    for (const entry of entries) {
      const ctor = exportedComponents[entry.className]!;
      for (const property of Object.keys(entry.properties)) {
        const descriptor = descriptorFor(ctor, property);
        expect(descriptor, `${entry.tag}.${property} must be declared`).toBeDefined();
        expect(typeof descriptor?.get, `${entry.tag}.${property} must have a getter`).toBe("function");
        expect(typeof descriptor?.set, `${entry.tag}.${property} must have a setter`).toBe("function");
      }
    }
  });

  it("declares an attribute for every documented property", () => {
    for (const entry of entries) {
      for (const property of Object.keys(entry.properties)) {
        expect(entry.attributes, `${entry.tag}.${property}`).toContain(kebabCase(property));
      }
    }
  });

  it("backs every documented property with its attribute", () => {
    for (const entry of entries) {
      const ctor = exportedComponents[entry.className]!;
      for (const [property, type] of Object.entries(entry.properties)) {
        const attribute = kebabCase(property);
        const value = sampleFor(type);

        if (ctor.elementProperties) {
          const options = ctor.elementProperties.get(property);
          expect(options, `${entry.tag}.${property} must be a Lit property`).toBeDefined();
          expect(
            options?.attribute,
            `${entry.tag}.${property} must not opt out of its attribute`
          ).not.toBe(false);
          const mapped =
            options?.attribute === undefined || options?.attribute === true
              ? attribute
              : options?.attribute;
          expect(mapped, `${entry.tag}.${property}`).toBe(attribute);
          continue;
        }

        const element = document.createElement(entry.tag) as HTMLElement & Record<string, unknown>;
        element[property] = value;
        if (typeof value === "boolean") {
          expect(element.hasAttribute(attribute), `${entry.tag}.${property}`).toBe(true);
        } else {
          expect(element.getAttribute(attribute), `${entry.tag}.${property}`).toBe(String(value));
        }
      }
    }
  });

  it("reflects host-state properties that styles depend on", () => {
    const hostState = new Set(["open", "variant"]);

    for (const entry of entries) {
      const ctor = exportedComponents[entry.className]!;
      if (!ctor.elementProperties) continue;
      for (const property of Object.keys(entry.properties)) {
        if (!hostState.has(property)) continue;
        const options = ctor.elementProperties.get(property);
        expect(options?.reflect, `${entry.tag}.${property} must reflect to its attribute`).toBe(true);
      }
    }
  });
});
