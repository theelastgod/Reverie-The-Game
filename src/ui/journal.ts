/**
 * Field notes: the current objective (plate, movement numeral, title, detail,
 * bearing) and a compact list of active quests with step numbers.
 */
import type { Objective } from "../sim/types";
import type { YouView } from "../sim/protocol";
import { assetUrl, bearingTo, questRows, roman, setClass, setText } from "./format";

export type JournalPanel = {
  set(objective: Objective | null, you: YouView): void;
  toggle(): void;
  destroy(): void;
};

const COLLAPSE_WIDTH = 1100; // matches hud.css: below this the journal is a tab

export function mountJournal(root: HTMLElement): JournalPanel {
  const panel = root.querySelector<HTMLElement>("#hud-journal");
  const tab = panel?.querySelector<HTMLButtonElement>(".journal-tab") ?? null;
  const plate = panel?.querySelector<HTMLImageElement>(".journal-plate") ?? null;
  const movement = panel?.querySelector<HTMLElement>(".journal-movement") ?? null;
  const title = panel?.querySelector<HTMLElement>(".journal-title") ?? null;
  const detail = panel?.querySelector<HTMLElement>(".journal-detail") ?? null;
  const bearing = panel?.querySelector<HTMLElement>(".journal-bearing") ?? null;
  const quests = panel?.querySelector<HTMLElement>(".journal-quests") ?? null;

  let objectiveSig = "";
  let plateFile = "";
  let questSig = "";

  const toggle = () => {
    if (!panel) return;
    if (window.innerWidth <= COLLAPSE_WIDTH) panel.classList.toggle("open");
    else panel.classList.toggle("closed");
  };
  tab?.addEventListener("click", toggle);

  return {
    set(objective, you) {
      if (!panel) return;
      const sig = objective
        ? [objective.quest, objective.step, objective.title, objective.detail, objective.plate, objective.movement].join("\u0000")
        : "";
      if (sig !== objectiveSig) {
        objectiveSig = sig;
        if (objective) {
          const file = objective.plate || "plate-arena.jpg";
          if (plate && plateFile !== file) {
            plateFile = file;
            plate.src = assetUrl(file);
          }
          setText(movement, `MOVEMENT ${roman(objective.movement)}`);
          setText(title, objective.title);
          setText(detail, objective.detail);
        } else {
          setText(movement, `MOVEMENT ${roman(you.movement)}`);
          setText(title, you.movement >= 5 ? "The rest of life" : "The city");
          setText(detail, you.movement >= 5 ? "The credits have run. The city stays open." : "No objective. Walk.");
        }
      }
      const b = objective ? bearingTo({ x: you.x, y: you.y, district: you.district }, objective.target) : "NO BEARING";
      setText(bearing, b);
      setClass(bearing, "here", b === "HERE");

      const rows = questRows(you.quests);
      const qsig = rows.map(r => r.id + r.step).join("|");
      if (qsig !== questSig && quests) {
        questSig = qsig;
        quests.replaceChildren();
        for (const r of rows) {
          const li = document.createElement("li");
          if (r.spine) li.className = "spine";
          const name = document.createElement("span");
          name.className = "name";
          name.textContent = r.label;
          const step = document.createElement("span");
          step.className = "step";
          step.textContent = r.step;
          li.append(name, step);
          quests.append(li);
        }
      }
    },
    toggle,
    destroy() {
      tab?.removeEventListener("click", toggle);
    },
  };
}
