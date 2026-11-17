import "@luisrodonccs/simplest-ui/tokens.css";
import "@luisrodonccs/simplest-ui/styles.css";
import "@luisrodonccs/simplest-ui/components/drawer";

const drawer = document.querySelector("#filters");
document.querySelector("[data-open-drawer]")?.addEventListener("click", () => {
  drawer.open = true;
});
