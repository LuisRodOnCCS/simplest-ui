import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";

type AvatarMember = { name: string; initials: string; image: string; size: string };

/** A compact group that expands in place. Direct children provide avatar data. */
@customElement("sui-avatar-group")
export class SuiAvatarGroup extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true, attribute: "show-names" }) showNames = false;
  @property({ type: String }) label = "Team members";
  @state() private members: AvatarMember[] = [];

  private readonly observer = new MutationObserver(() => this.collectMembers());
  private pinned = false;
  private suppressed = false;
  private pointerInside = false;
  private pointerDown = false;
  private animation?: Animation;
  private memberAnimations: Animation[] = [];
  private animationVersion = 0;

  static styles = css`
    :host { display: inline-block; position: relative; vertical-align: middle; }
    * { box-sizing: border-box; }
    .spacer, .surface { display: inline-flex; align-items: center; }
    .spacer { visibility: hidden; pointer-events: none; padding: var(--sui-space-0-5); border: 1px solid transparent; }
    .surface {
      position: absolute; top: 0; left: 0; z-index: 1;
      flex-wrap: wrap; width: max-content; max-width: min(28rem, calc(100vw - 16px));
      max-height: calc(100vh - 16px); overflow: auto;
      padding: var(--sui-space-0-5); margin: 0; border: 1px solid transparent;
      border-radius: var(--sui-radius-full); background: transparent; color: var(--sui-color-text);
      font: inherit; text-align: left; cursor: pointer;
      transition: transform var(--sui-duration-normal) var(--sui-easing-standard),
        background-color var(--sui-duration-normal) var(--sui-easing-standard),
        border-color var(--sui-duration-normal) var(--sui-easing-standard),
        box-shadow var(--sui-duration-normal) var(--sui-easing-standard);
    }
    :host([data-expanded]) .surface {
      z-index: var(--sui-z-popover); padding: var(--sui-space-0-5);
      background: var(--sui-color-surface-raised); border-color: var(--sui-color-border);
      border-radius: var(--sui-radius-full); box-shadow: var(--sui-shadow-floating);
    }
    .trigger {
      position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%;
      padding: 0; border: 0; border-radius: inherit; background: transparent; cursor: pointer;
    }
    .trigger:focus-visible { outline: none; box-shadow: var(--sui-focus-ring); }
    .member { display: inline-flex; align-items: center; flex: none; min-width: 0; }
    .avatar {
      display: inline-flex; align-items: center; justify-content: center; flex: none;
      width: var(--sui-avatar-size, 36px); height: var(--sui-avatar-size, 36px);
      overflow: hidden; border: 2px solid var(--sui-color-surface-raised);
      border-radius: var(--sui-radius-full); background: var(--sui-gradient-primary);
      color: var(--sui-color-primary-contrast); font-size: var(--sui-font-size-sm);
      font-weight: var(--sui-font-weight-semibold);
    }
    .avatar.sm { --sui-avatar-size: 24px; font-size: var(--sui-font-size-3xs); }
    .avatar.lg { --sui-avatar-size: 48px; font-size: var(--sui-font-size-base); }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .spacer .member:not(:first-child), .surface .member:not(:first-child) {
      margin-left: calc(var(--sui-space-2) * -1);
    }
    .surface .extra {
      max-width: 0; opacity: 0; overflow: hidden; margin: 0 !important;
      transition: opacity var(--sui-duration-normal) var(--sui-easing-standard);
    }
    :host([data-expanded]) .surface .member:not(:first-child) { margin-left: var(--sui-space-2); }
    :host([data-expanded]) .surface .extra { max-width: 20rem; opacity: 1; margin-left: var(--sui-space-2) !important; }
    .count { overflow: hidden; max-width: 5rem; opacity: 1; }
    :host([data-expanded]) .surface .member.count { position: absolute; opacity: 0; margin: 0; pointer-events: none; }
    .name { max-width: 0; overflow: hidden; opacity: 0; white-space: nowrap; font-size: var(--sui-font-size-sm);
    }
    :host([data-expanded][show-names]) .name { max-width: 12rem; opacity: 1; padding-left: var(--sui-space-2); }
    :host([data-expanded][show-names]) .surface {
      flex-direction: column; flex-wrap: nowrap; align-items: stretch;
      border-radius: var(--sui-radius-md); padding: var(--sui-space-1);
      max-height: min(calc(var(--sui-avatar-group-visible-rows, 5) * 48px + 2 * var(--sui-space-1) + 2px), calc(100vh - 16px));
    }
    :host([data-expanded][show-names]) .surface .member:not(.count) {
      min-height: 48px; margin: 0 !important;
    }
    :host([data-expanded][show-names]) .surface .member.count { display: none; }
    :host([data-expanded][show-names]) .name { max-width: min(12rem, calc(100vw - 90px)); text-overflow: ellipsis; }
    .surface:popover-open { position: fixed; inset: auto; margin: 0; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    @media (prefers-reduced-motion: reduce) {
      .surface, .surface .member, .surface .extra, .count, .name { transition: none !important; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.collectMembers();
    this.observer.observe(this, { childList: true, subtree: true, attributes: true, characterData: true });
    queueMicrotask(() => { if (this.isConnected) this.collectMembers(); });
    document.addEventListener("pointerdown", this.onDocumentPointerDown);
    document.addEventListener("keydown", this.onDocumentKeyDown, true);
    window.addEventListener("resize", this.positionSurface);
    window.addEventListener("scroll", this.onScroll, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.animationVersion++;
    this.animation?.cancel();
    this.memberAnimations.forEach(animation => animation.cancel());
    this.observer.disconnect();
    document.removeEventListener("pointerdown", this.onDocumentPointerDown);
    document.removeEventListener("keydown", this.onDocumentKeyDown, true);
    window.removeEventListener("resize", this.positionSurface);
    window.removeEventListener("scroll", this.onScroll, true);
  }

  protected updated(changed: PropertyValues) {
    if (changed.has("open") && !this.open) this.pinned = false;
    const surface = this.renderRoot.querySelector<HTMLElement>(".surface");
    if (!surface) return;
    if (changed.has("open")) {
      const version = ++this.animationVersion;
      this.animation?.cancel();
      this.memberAnimations.forEach(animation => animation.cancel());
      this.memberAnimations = [];
      if (this.open) {
        this.setAttribute("data-expanded", "");
        if (typeof surface.showPopover === "function" && !surface.matches(":popover-open")) {
          surface.setAttribute("popover", "manual");
          surface.showPopover();
        }
        this.positionSurface();
        this.animateSurface(surface, true);
      } else if (this.hasAttribute("data-expanded")) {
        const animation = this.animateSurface(surface, false);
        if (animation) {
          void animation.finished.catch(() => {}).then(() => {
            if (version === this.animationVersion && !this.open) this.finishClose(surface);
          });
        } else {
          this.finishClose(surface);
        }
      }
    } else if (this.open) {
      this.positionSurface();
    }
  }

  private finishClose(surface: HTMLElement) {
    this.removeAttribute("data-expanded");
    this.animation?.cancel();
    this.memberAnimations.forEach(animation => animation.cancel());
    this.memberAnimations = [];
    const count = surface.querySelector<HTMLElement>(".member.count");
    count?.style.removeProperty("left");
    count?.style.removeProperty("top");
    if (surface.hasAttribute("popover")) {
      surface.hidePopover();
      surface.removeAttribute("popover");
      surface.style.removeProperty("left");
      surface.style.removeProperty("top");
    }
  }

  private animateSurface(surface: HTMLElement, entering: boolean): Animation | undefined {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof surface.animate !== "function") return;
    const durationValue = getComputedStyle(this).getPropertyValue("--sui-duration-normal").trim();
    const duration = Number.parseFloat(durationValue) * (durationValue.endsWith("ms") ? 1 : 1000);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const compact = this.getBoundingClientRect();
    const expanded = surface.getBoundingClientRect();
    const right = Math.max(0, expanded.width - compact.width);
    const bottom = Math.max(0, expanded.height - compact.height);
    const from = this.showNames
      ? { opacity: 0, transform: "translateY(-4px)" }
      : { clipPath: `inset(0px ${right}px ${bottom}px 0px round 999px)`, transform: "translateY(0px)" };
    const to = this.showNames
      ? { opacity: 1, transform: "translateY(0px)" }
      : { clipPath: "inset(0px 0px 0px 0px round 999px)", transform: "translateY(0px)" };
    if (!this.showNames) {
      const compactMembers = [...this.renderRoot.querySelectorAll<HTMLElement>(".spacer .member:not(.count)")];
      const expandedMembers = [...surface.querySelectorAll<HTMLElement>(".member:not(.count)")];
      expandedMembers.forEach((member, index) => {
        const source = compactMembers[Math.min(index, compactMembers.length - 1)];
        if (!source) return;
        const start = source.getBoundingClientRect();
        const end = member.getBoundingClientRect();
        const collapsed = { transform: `translate(${start.left - end.left}px, ${start.top - end.top}px)`, opacity: index >= 3 ? 0 : 1 };
        const expandedFrame = { transform: "translate(0, 0)", opacity: 1 };
        const animation = member.animate(entering
          ? [{ ...collapsed, offset: 0 }, { ...collapsed, offset: 0.2 }, { ...expandedFrame, offset: 1 }]
          : [{ ...expandedFrame, offset: 0 }, { ...collapsed, offset: 0.8 }, { ...collapsed, offset: 1 }], {
          duration, easing: "ease", fill: "both",
        });
        this.memberAnimations.push(animation);
        if (entering) void animation.finished.then(() => animation.cancel()).catch(() => {});
      });
      const compactCount = this.renderRoot.querySelector<HTMLElement>(".spacer .count");
      const count = surface.querySelector<HTMLElement>(".member.count");
      if (compactCount && count) {
        const start = compactCount.getBoundingClientRect();
        count.style.left = `${start.left - expanded.left - surface.clientLeft}px`;
        count.style.top = `${start.top - expanded.top - surface.clientTop}px`;
        const animation = count.animate(entering
          ? [{ opacity: 1, offset: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 0, offset: 1 }]
          : [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1, offset: 1 }], {
          duration, easing: "ease", fill: "both",
        });
        this.memberAnimations.push(animation);
        if (entering) void animation.finished.then(() => animation.cancel()).catch(() => {});
      }
    }
    const elevated = { ...from };
    const frames = this.showNames ? (entering ? [from, to] : [to, from])
      : entering ? [{ ...from, offset: 0 }, { ...elevated, offset: 0.2 }, { ...to, offset: 1 }]
        : [{ ...to, offset: 0 }, { ...elevated, offset: 0.8 }, { ...from, offset: 1 }];
    this.animation = surface.animate(frames, {
      duration, easing: "ease", fill: "both",
    });
    if (entering) {
      const animation = this.animation;
      void animation.finished.then(() => animation.cancel()).catch(() => {});
    }
    return this.animation;
  }

  private positionSurface = () => {
    const surface = this.renderRoot.querySelector<HTMLElement>(".surface");
    if (!this.hasAttribute("data-expanded") || !surface?.matches(":popover-open")) return;
    const anchor = this.getBoundingClientRect();
    const bounds = surface.getBoundingClientRect();
    surface.style.left = `${Math.max(8, Math.min(anchor.left, window.innerWidth - bounds.width - 8))}px`;
    surface.style.top = `${Math.max(8, Math.min(anchor.top, window.innerHeight - bounds.height - 8))}px`;
  };

  private onScroll = (event: Event) => {
    const surface = this.renderRoot.querySelector<HTMLElement>(".surface");
    if (surface && event.composedPath().includes(surface)) return;
    if (!this.open) {
      if (this.hasAttribute("data-expanded")) this.positionSurface();
      return;
    }
    this.positionSurface();
    this.pinned = false;
    this.suppressed = true;
    this.pointerInside = false;
    this.open = false;
  };

  private collectMembers() {
    this.members = Array.from(this.children).map((element) => {
      const image = element instanceof HTMLImageElement ? element : element.querySelector("img");
      return {
        name: element.getAttribute("aria-label")?.trim() || image?.alt.trim() || element.textContent?.trim() || "",
        initials: image ? "" : element.textContent?.trim() || "",
        image: image?.getAttribute("src") || "",
        size: element.classList.contains("ui-avatar--sm") ? "sm" : element.classList.contains("ui-avatar--lg") ? "lg" : "",
      };
    }).filter((member) => Boolean(member.name));
  }

  private onEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    this.pointerInside = true;
    if (!this.suppressed) this.open = true;
  };

  private onLeave = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    this.pointerInside = false;
    this.suppressed = false;
    if (!this.pinned && !this.matches(":focus-within")) this.open = false;
  };

  private onClick = (event: MouseEvent) => {
    this.pointerDown = false;
    if (event.detail === 0) {
      this.pinned = false;
      this.suppressed = this.open;
      this.open = !this.open;
      return;
    }
    if (this.pinned) {
      this.pinned = false;
      this.suppressed = true;
      this.open = false;
    } else {
      this.pinned = true;
      this.suppressed = false;
      this.open = true;
    }
  };

  private onFocus = () => {
    if (!this.pointerDown && !this.suppressed) this.open = true;
  };

  private onBlur = () => queueMicrotask(() => {
    if (!this.isConnected) return;
    if (!this.shadowRoot?.activeElement && !this.matches(":focus-within") && !this.pointerInside) {
      this.pinned = false;
      this.open = false;
    }
  });

  private onSurfaceKeyDown = (event: KeyboardEvent) => {
    const surface = this.renderRoot.querySelector<HTMLElement>(".surface");
    if (!surface) return;
    if (!this.open || surface.scrollHeight <= surface.clientHeight) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    surface.scrollTop += (event.key === "ArrowDown" ? 1 : -1) * surface.clientHeight / 4;
  };

  private onDocumentPointerDown = (event: PointerEvent) => {
    if (this.open && !event.composedPath().includes(this)) {
      this.pinned = false;
      this.open = false;
    }
  };

  private onDocumentKeyDown = (event: KeyboardEvent) => {
    if (!this.open || event.key !== "Escape") return;
    if (!this.pointerInside && !event.composedPath().includes(this)) return;
    event.preventDefault();
    event.stopPropagation();
    this.pinned = false;
    this.suppressed = true;
    this.open = false;
  };

  private avatar(member: AvatarMember) {
    return html`<span class="avatar ${member.size}">${member.image
      ? html`<img src=${member.image} alt="" />` : member.initials}</span>`;
  }

  private compact() {
    return html`${this.members.slice(0, 3).map((member) => html`<span class="member">${this.avatar(member)}</span>`)}
      ${this.members.length > 3 ? html`<span class="member count"><span class="avatar">+${this.members.length - 3}</span></span>` : nothing}`;
  }

  render() {
    return html`
      <span class="spacer" aria-hidden="true">${this.compact()}</span>
      <div class="surface" @pointerenter=${this.onEnter} @pointerleave=${this.onLeave}>
        ${this.members.map((member, index) => html`<span class="member ${index >= 3 ? "extra" : ""}" aria-hidden="true">${this.avatar(member)}${this.showNames ? html`<span class="name">${member.name}</span>` : nothing}</span>`)}
        ${this.members.length > 3 ? html`<span class="member count" aria-hidden="true"><span class="avatar">+${this.members.length - 3}</span></span>` : nothing}
        <button class="trigger" type="button" aria-label=${this.label} aria-expanded=${String(this.open)}
          aria-controls="members" @pointerdown=${() => { this.pointerDown = true; }}
          @pointercancel=${() => { this.pointerDown = false; }}
          @click=${this.onClick} @focus=${this.onFocus} @blur=${this.onBlur} @keydown=${this.onSurfaceKeyDown}></button>
      </div>
      <ul id="members" class="sr-only" aria-label=${this.label}>
        ${this.members.map((member) => html`<li>${member.name}</li>`)}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { "sui-avatar-group": SuiAvatarGroup; }
}
