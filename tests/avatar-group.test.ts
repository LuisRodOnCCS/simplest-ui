import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/components/avatar-group";
import type { SuiAvatarGroup } from "../src/components/avatar-group";

afterEach(() => { document.body.replaceChildren(); });

describe("sui-avatar-group", () => {
  it("renders names from children and updates when members change", async () => {
    document.body.innerHTML = `<sui-avatar-group label="Team" show-names>
      <span class="ui-avatar" aria-label="Ada">AL</span>
      <span class="ui-avatar"><img alt="Grace" src="grace.png"></span>
    </sui-avatar-group>`;
    const group = document.querySelector("sui-avatar-group") as SuiAvatarGroup;
    await group.updateComplete;
    expect(group.shadowRoot!.querySelector(".trigger")!.getAttribute("aria-label")).toBe("Team");
    await vi.waitFor(() => expect([...group.shadowRoot!.querySelectorAll(".name")].map(el => el.textContent)).toEqual(["Ada", "Grace"]));
    group.firstElementChild!.setAttribute("aria-label", "Ada Lovelace");
    await vi.waitFor(() => expect(group.shadowRoot!.querySelector(".name")!.textContent).toBe("Ada Lovelace"));
    group.showNames = false;
    await group.updateComplete;
    expect(group.shadowRoot!.querySelectorAll(".name")).toHaveLength(0);
  });

  it("does not change the existing static avatar group", () => {
    document.body.innerHTML = `<div class="ui-avatar-group"><span class="ui-avatar">A</span></div>`;
    expect(document.querySelector(".ui-avatar-group")!.localName).toBe("div");
  });

  it("shows a remaining count only when more than three members exist", async () => {
    document.body.innerHTML = `<sui-avatar-group>
      <span aria-label="A">A</span><span aria-label="B">B</span><span aria-label="C">C</span>
    </sui-avatar-group>`;
    const group = document.querySelector("sui-avatar-group") as SuiAvatarGroup;
    await vi.waitFor(() => expect(group.shadowRoot!.querySelectorAll(".surface .member")).toHaveLength(3));
    expect(group.shadowRoot!.querySelector(".surface .count")).toBeNull();
    const fourth = document.createElement("span");
    fourth.setAttribute("aria-label", "D");
    fourth.textContent = "D";
    group.append(fourth);
    await vi.waitFor(() => expect(group.shadowRoot!.querySelector(".surface .count")!.textContent).toContain("+1"));
  });
});
