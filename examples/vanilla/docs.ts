type ThemeChoice = "light" | "dark" | "system";

const storageKey = "simplest-ui-docs-theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");

function appliedTheme(choice: ThemeChoice): "light" | "dark" {
  return choice === "system" ? (media.matches ? "dark" : "light") : choice;
}

function setTheme(choice: ThemeChoice) {
  document.documentElement.dataset.theme = appliedTheme(choice);
  document.documentElement.dataset.themeChoice = choice;

  document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === choice));
  });
}

function savedTheme(): ThemeChoice {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return "system";
  }
}

setTheme(savedTheme());

media.addEventListener("change", () => {
  if (document.documentElement.dataset.themeChoice === "system") setTheme("system");
});

document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.themeChoice as ThemeChoice;
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch {
      // Theme selection still works when storage is unavailable.
    }
    setTheme(choice);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = document.querySelector<HTMLElement>(button.dataset.copy ?? "");
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code.innerText.trim());
      button.textContent = "Copiado";
      window.setTimeout(() => { button.textContent = "Copiar"; }, 1600);
    } catch {
      button.textContent = "Selecciona el código";
    }
  });
});

const modal = document.querySelector<HTMLElement>("#docs-modal");
document.querySelector("#open-modal")?.addEventListener("click", () => modal?.setAttribute("open", ""));
document.querySelector("#close-modal")?.addEventListener("click", () => modal?.removeAttribute("open"));

document.querySelector("#show-toast")?.addEventListener("click", () => {
  customElements.whenDefined("sui-toast").then(() => {
    const Toast = customElements.get("sui-toast") as typeof HTMLElement & {
      show: (options: { title: string; message: string; variant: "success"; duration: number }) => void;
    };
    Toast.show({ title: "Cambios guardados", message: "La operación se completó correctamente.", variant: "success", duration: 3200 });
  });
});

document.querySelector("#open-drawer")?.addEventListener("click", () => {
  const drawer = document.querySelector<HTMLElement & { open?: boolean }>("#docs-drawer");
  if (drawer) drawer.open = true;
});
