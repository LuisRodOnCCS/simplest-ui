import { SuiToast } from "../../src/components/toast.ts";

const stack = document.querySelector("#toast-stack");
const standaloneArea = document.querySelector("#standalone-area");

document.querySelector("#show-stack").addEventListener("click", () => {
  SuiToast.show({ message: "Aviso en contenedor: cambios guardados.", duration: 0 });
});

document.querySelector("#show-standalone").addEventListener("click", () => {
  const toast = document.createElement("sui-toast");
  toast.message = "Aviso independiente: conexión recuperada.";
  toast.duration = 0;
  standaloneArea.append(toast);
});

document.querySelector("#clear-toasts").addEventListener("click", () => {
  stack.replaceChildren();
  standaloneArea.replaceChildren();
});

function setTooltip(text) {
  const tooltip = document.querySelector("sui-tooltip");
  const replacement = document.createElement("span");
  replacement.slot = "content";
  replacement.textContent = text;
  tooltip.querySelector('[slot="content"]').replaceWith(replacement);
}

document.querySelector("#replace-tooltip").addEventListener("click", () => {
  setTooltip("Tooltip actualizado: revisa el dominio de tu correo.");
});
document.querySelector("#reset-tooltip").addEventListener("click", () => {
  setTooltip("Tooltip inicial: usa tu correo de trabajo.");
});

document.querySelector("#open-drawer").addEventListener("click", () => {
  document.querySelector("#manual-drawer").open = true;
});
document.querySelector("#open-modal").addEventListener("click", () => {
  document.querySelector("#manual-modal").open = true;
});
