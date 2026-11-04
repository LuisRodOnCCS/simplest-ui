import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("sui-modal")
export class SuiModal extends LitElement {
  static styles = css`
    :host {
      display: none;
    }
    :host([open]) {
      display: block;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: var(--sui-color-backdrop);
      backdrop-filter: blur(var(--sui-blur-backdrop));
      -webkit-backdrop-filter: blur(var(--sui-blur-backdrop));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--sui-z-modal);
      padding: var(--sui-space-4);
    }
    .panel {
      background: var(--sui-color-surface-raised);
      color: var(--sui-color-text);
      border: 1px solid var(--sui-color-border);
      border-radius: var(--sui-radius-xl);
      box-shadow: var(--sui-shadow-modal);
      backdrop-filter: blur(var(--sui-blur-lg));
      -webkit-backdrop-filter: blur(var(--sui-blur-lg));
      width: var(--sui-modal-width, 380px);
      max-width: 100%;
      max-height: 90vh;
      overflow: auto;
      padding: var(--sui-space-5-5);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sui-space-3);
      margin-bottom: var(--sui-space-2);
    }
    .title {
      font-size: var(--sui-font-size-base);
      font-weight: var(--sui-font-weight-semibold);
      margin: 0;
    }
    .close {
      background: transparent;
      border: 0;
      font-size: var(--sui-font-size-xl);
      line-height: 1;
      color: var(--sui-color-text-muted);
      padding: 0;
      cursor: pointer;
    }
    .close:hover {
      color: var(--sui-color-text);
    }
    .body {
      font-size: var(--sui-font-size-sm);
      color: var(--sui-color-text-muted);
      margin-bottom: var(--sui-space-4-5);
    }
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--sui-space-2);
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.open) {
      this.close();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleKeydown);
  }

  openModal() {
    this.open = true;
    this.dispatchEvent(new CustomEvent("sui-open", { bubbles: true, composed: true }));
  }

  close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("sui-close", { bubbles: true, composed: true }));
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="backdrop" @click=${(e: Event) => {
        if (e.target === e.currentTarget) this.close();
      }}>
        <div class="panel" role="dialog" aria-modal="true">
          <div class="header">
            <div class="title"><slot name="title"></slot></div>
            <button class="close" type="button" aria-label="Cerrar" @click=${() => this.close()}>×</button>
          </div>
          <div class="body"><slot></slot></div>
          <div class="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sui-modal": SuiModal;
  }
}
