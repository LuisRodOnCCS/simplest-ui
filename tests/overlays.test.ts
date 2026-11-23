import { afterEach, describe, expect, it } from "vitest";
import "../src/components/modal";
import "../src/components/drawer";
import type { SuiModal } from "../src/components/modal";
import type { SuiDrawer } from "../src/components/drawer";

afterEach(() => {
  document.body.replaceChildren();
  document.body.style.overflow = "";
});

describe("overlay ownership", () => {
  it.each([["sui-modal", "sui-drawer"], ["sui-drawer", "sui-modal"]])(
    "restores scroll and closes only the topmost %s + %s",
    async (firstTag, secondTag) => {
      document.body.style.overflow = "scroll";
      const first = document.createElement(firstTag) as SuiModal | SuiDrawer;
      const second = document.createElement(secondTag) as SuiModal | SuiDrawer;
      document.body.append(first, second);
      await Promise.all([first.updateComplete, second.updateComplete]);
      first.open = true;
      await first.updateComplete;
      second.open = true;
      await second.updateComplete;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await Promise.all([first.updateComplete, second.updateComplete]);
      expect(first.open).toBe(true);
      expect(second.open).toBe(false);
      expect(document.body.style.overflow).toBe("hidden");
      first.remove();
      expect(document.body.style.overflow).toBe("scroll");
      document.body.append(first);
      expect(document.body.style.overflow).toBe("hidden");
      first.open = false;
      await first.updateComplete;
      expect(document.body.style.overflow).toBe("scroll");
    }
  );
});
