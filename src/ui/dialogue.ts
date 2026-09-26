/**
 * The dialogue panel: portrait, speaker in Anton, text, a Wink in void and
 * champagne when the viewer is allowed one, numbered choices 1–4, Continue.
 * Esc is handled by the scene; this panel only reports clicks.
 */
import type { DialogueView } from "../sim/types";
import { assetUrl, setText, show } from "./format";
import { gen, pickGen } from "../assets/gen";
import { portraitFor } from "../assets/slots";

export type DialoguePanel = {
  set(view: DialogueView | null): void;
  readonly open: boolean;
  destroy(): void;
};

export function mountDialogue(root: HTMLElement, callbacks: { choose: (choiceId: string) => void; close: () => void }): DialoguePanel {
  const panel = root.querySelector<HTMLElement>("#hud-dialogue");
  const portrait = panel?.querySelector<HTMLImageElement>(".dlg-portrait") ?? null;
  const speaker = panel?.querySelector<HTMLElement>(".dlg-speaker") ?? null;
  const text = panel?.querySelector<HTMLElement>(".dlg-text") ?? null;
  const winkBox = panel?.querySelector<HTMLElement>(".dlg-wink") ?? null;
  const winkText = panel?.querySelector<HTMLElement>(".dlg-wink-text") ?? null;
  const choices = panel?.querySelector<HTMLElement>(".dlg-choices") ?? null;

  let signature = "";
  let currentPortrait = "";
  let isOpen = false;

  const onChoicesClick = (ev: MouseEvent) => {
    const t = (ev.target as HTMLElement | null)?.closest<HTMLButtonElement>("button[data-choice]");
    if (!t) return;
    ev.preventDefault();
    const id = t.dataset.choice ?? "";
    if (id === "") callbacks.close();
    else callbacks.choose(id);
  };
  choices?.addEventListener("click", onChoicesClick);

  const buildChoices = (view: DialogueView) => {
    if (!choices) return;
    choices.replaceChildren();
    if (view.choices.length === 0) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice continue";
      btn.dataset.choice = "";
      const cap = document.createElement("kbd");
      cap.className = "cap";
      cap.textContent = "ESC";
      btn.append(cap, document.createTextNode("Continue"));
      choices.append(btn);
      return;
    }
    view.choices.slice(0, 4).forEach((c, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.dataset.choice = c.id;
      const cap = document.createElement("kbd");
      cap.className = "cap";
      cap.textContent = String(i + 1);
      btn.append(cap, document.createTextNode(c.label));
      choices.append(btn);
    });
  };

  return {
    get open() { return isOpen; },
    set(view) {
      if (!panel) return;
      if (!view) {
        if (isOpen) {
          isOpen = false;
          signature = "";
          show(panel, false);
          root.classList.remove("dialogue-open");
        }
        return;
      }
      const sig = [view.npc, view.node, view.speaker, view.portrait, view.text, view.wink, view.choices.map(c => c.id + "=" + c.label).join("|")].join("\u0000");
      if (sig === signature) return;
      signature = sig;
      // A generated portrait for the secondary people when the manifest has it; else the content's plate.
      const src = pickGen(gen.current, portraitFor(view.npc), assetUrl(view.portrait || "guest.jpg"));
      if (portrait && currentPortrait !== src) {
        currentPortrait = src;
        portrait.src = src;
      }
      setText(speaker, view.speaker || "The city");
      setText(text, view.text);
      const hasWink = view.wink.trim().length > 0;
      show(winkBox, hasWink);
      setText(winkText, hasWink ? view.wink : "");
      buildChoices(view);
      if (!isOpen) {
        isOpen = true;
        show(panel, true);
        root.classList.add("dialogue-open");
      }
    },
    destroy() {
      choices?.removeEventListener("click", onChoicesClick);
    },
  };
}
