const EXAMPLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateManifest(manifest) {
  const errors = [];
  const entries = [...(manifest.cssComponents ?? []), ...(manifest.layouts ?? [])];
  const allEntries = [
    ...(manifest.webComponents ?? []),
    ...entries,
    ...(manifest.pages ?? [])
  ];

  if (manifest.schemaVersion !== 1) {
    errors.push(`components.manifest.json must declare "schemaVersion": 1.`);
  }

  const documentationIds = new Set();
  for (const entry of allEntries) {
    if (!entry.documentationId) {
      errors.push(`Entry "${entry.name ?? entry.tag ?? "unknown"}" has no documentationId.`);
      continue;
    }
    if (documentationIds.has(entry.documentationId)) {
      errors.push(`Duplicate documentationId "${entry.documentationId}".`);
    }
    documentationIds.add(entry.documentationId);
  }

  const declaredClasses = new Set(entries.flatMap((entry) => entry.classes ?? []));

  const validateComponentEntry = (entry, name, validateClasses) => {
    if (!entry.contract || typeof entry.contract !== "object") {
      errors.push(`Entry "${name}" must declare a contract.`);
    } else {
      validateStringArray(entry.contract.required, `"${name}".contract.required`, errors);
      validateStringArray(entry.contract.recommended, `"${name}".contract.recommended`, errors);
    }
    if (!Array.isArray(entry.examples) || entry.examples.length === 0) {
      errors.push(`Entry "${name}" must declare at least one example.`);
      return;
    }

    const exampleIds = new Set();
    for (const example of entry.examples) {
      const location = `"${name}" example "${example.id ?? "unknown"}"`;
      if (typeof example.id !== "string" || !EXAMPLE_ID.test(example.id)) {
        errors.push(`${location} must have a lowercase kebab-case id.`);
      } else if (exampleIds.has(example.id)) {
        errors.push(`Entry "${name}" has duplicate example id "${example.id}".`);
      } else {
        exampleIds.add(example.id);
      }
      if (typeof example.label !== "string" || !example.label.trim()) {
        errors.push(`${location} must have a label.`);
      }
      if (typeof example.markup !== "string" || !example.markup.trim()) {
        errors.push(`${location} must have markup.`);
      }
      const preview = example.preview ?? example.markup;
      if (typeof preview !== "string" || !preview.trim()) {
        errors.push(`${location} must have a preview.`);
      } else if (example.id !== "default" && preview.includes("...")) {
        errors.push(`${location} needs a complete preview; replace "..." with concrete content or add a preview.`);
      }
      validateStringArray(example.required, `${location}.required`, errors);
      validateStringArray(example.recommended, `${location}.recommended`, errors);

      if (validateClasses) {
        for (const className of new Set([...classesIn(example.markup), ...classesIn(preview)])) {
          if (className.startsWith("ui-") && !declaredClasses.has(className)) {
            errors.push(`${location} uses undeclared class "${className}". Add it to the entry classes first.`);
          }
        }
      }
    }

    if (!exampleIds.has("default")) {
      errors.push(`Entry "${name}" must declare an example with id "default".`);
    }
  };

  for (const entry of entries) {
    const name = entry.name;
    if (!Array.isArray(entry.classes) || entry.classes.length === 0) {
      errors.push(`Entry "${name}" must declare at least one class.`);
    }
    validateComponentEntry(entry, name, true);
  }

  for (const entry of manifest.webComponents ?? []) {
    validateComponentEntry(entry, entry.tag ?? entry.documentationId ?? "unknown", false);
  }

  return errors;
}

export function buildContracts(manifest) {
  const components = {};
  for (const entry of [...manifest.cssComponents, ...manifest.layouts]) {
    components[entry.documentationId] = {
      name: entry.name,
      kind: manifest.layouts.includes(entry) ? "layout" : "css",
      classes: entry.classes,
      contract: entry.contract,
      examples: entry.examples
    };
  }
  for (const entry of manifest.webComponents ?? []) {
    components[entry.documentationId] = {
      name: entry.tag,
      kind: "web-component",
      tag: entry.tag,
      import: entry.import,
      attributes: entry.attributes,
      properties: entry.properties,
      slots: entry.slots,
      events: entry.events,
      eventDetails: entry.eventDetails,
      keyboard: entry.keyboard,
      api: entry.api,
      contract: entry.contract,
      examples: entry.examples
    };
  }
  return {
    schemaVersion: manifest.schemaVersion,
    version: manifest.version,
    components
  };
}

function validateStringArray(value, location, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${location} must be an array of strings.`);
    return;
  }
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      errors.push(`${location} must only contain non-empty strings.`);
    }
  }
}

function classesIn(markup) {
  const classes = new Set();
  if (typeof markup !== "string") return classes;
  for (const match of markup.matchAll(/\bclass="([^"]*)"/g)) {
    for (const className of match[1].split(/\s+/)) {
      if (className) classes.add(className);
    }
  }
  return classes;
}
