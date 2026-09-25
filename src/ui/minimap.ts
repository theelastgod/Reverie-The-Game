/**
 * A 208×160 canvas of the city: district rects with their tint, gates, you as
 * a paper dot, NPCs as gold dots, the objective as a pulsing dot, wreckage as
 * wine dots. Redraws at most 10 Hz.
 */
import { DISTRICTS, GATES, TILE, WORLD_H, WORLD_W } from "../sim/map";
import type { Snap } from "../sim/protocol";
import { assetUrl } from "./format";

export type MinimapPanel = {
  update(snap: Snap): void;
  toggle(): void;
  destroy(): void;
};

const W = 208;
const H = 160;
const MIN_INTERVAL = 100; // ms → 10 Hz

const PAPER = "#ffffff";
const GOLD = "#c9a56a";
const WINE = "#7a1028";
const SKY = "#7eb6ff";
const LAVENDER = "#b9b0d8";
const VOID = "#0a0a0a";

function hex(tint: number): string {
  return "#" + tint.toString(16).padStart(6, "0");
}

export function mountMinimap(root: HTMLElement): MinimapPanel {
  const panel = root.querySelector<HTMLElement>("#hud-minimap");
  const canvas = panel?.querySelector<HTMLCanvasElement>("canvas") ?? null;
  const ctx = canvas?.getContext("2d") ?? null;
  const sx = W / WORLD_W;
  const sy = H / WORLD_H;
  let lastDraw = 0;
  let latest: Snap | null = null;

  const mark = new Image();
  let markReady = false;
  mark.onload = () => { markReady = true; };
  mark.src = assetUrl("wing-star.png");

  const draw = (snap: Snap, now: number) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, W, H);

    // districts
    for (const d of DISTRICTS) {
      const x = d.rect.x * TILE * sx;
      const y = d.rect.y * TILE * sy;
      const w = d.rect.w * TILE * sx;
      const h = d.rect.h * TILE * sy;
      const frozen = snap.frozen.includes(d.id);
      ctx.globalAlpha = frozen ? 0.35 : 0.6;
      ctx.fillStyle = frozen ? LAVENDER : hex(d.tint);
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      if (frozen) {
        ctx.strokeStyle = LAVENDER;
        ctx.lineWidth = 1;
        for (let yy = y + 2; yy < y + h; yy += 4) {
          ctx.beginPath();
          ctx.moveTo(x, yy);
          ctx.lineTo(x + w, yy);
          ctx.stroke();
        }
      }
      if (d.id === snap.district) {
        ctx.strokeStyle = PAPER;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
      }
    }

    // gates
    ctx.fillStyle = PAPER;
    ctx.globalAlpha = 0.8;
    for (const g of GATES) {
      const x = g.rect.x * TILE * sx;
      const y = g.rect.y * TILE * sy;
      ctx.fillRect(x, y, Math.max(2, g.rect.w * TILE * sx), Math.max(2, g.rect.h * TILE * sy));
    }
    ctx.globalAlpha = 1;

    // wreckage
    ctx.fillStyle = WINE;
    for (const w of snap.wreckage) {
      if (w.buried) continue;
      ctx.fillRect(w.x * sx - 1, w.y * sy - 1, 2, 2);
    }

    // npcs
    ctx.fillStyle = GOLD;
    for (const n of snap.npcs) {
      if (!n.present) continue;
      ctx.beginPath();
      ctx.arc(n.x * sx, n.y * sy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // other players (dim paper)
    ctx.fillStyle = PAPER;
    ctx.globalAlpha = 0.5;
    for (const p of snap.players) {
      ctx.fillRect(p.x * sx - 1, p.y * sy - 1, 2, 2);
    }
    ctx.globalAlpha = 1;

    // objective, pulsing
    const target = snap.objective?.target;
    if (target) {
      const pulse = 0.5 + 0.5 * Math.sin(now / 240);
      ctx.strokeStyle = SKY;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5 + 0.5 * pulse;
      ctx.beginPath();
      ctx.arc(target.x * sx, target.y * sy, 2.5 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = SKY;
      ctx.beginPath();
      ctx.arc(target.x * sx, target.y * sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // you
    const you = snap.you;
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.arc(you.x * sx, you.y * sy, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = VOID;
    ctx.lineWidth = 1;
    ctx.stroke();

    // the mark as north
    if (markReady) {
      ctx.drawImage(mark, W - 24, 4, 20, 20);
    }
  };

  return {
    update(snap) {
      latest = snap;
      if (!panel || panel.hidden) return;
      const now = performance.now();
      if (now - lastDraw < MIN_INTERVAL) return;
      lastDraw = now;
      draw(snap, now);
    },
    toggle() {
      if (!panel) return;
      panel.hidden = !panel.hidden;
      if (!panel.hidden && latest) {
        lastDraw = performance.now();
        draw(latest, lastDraw);
      }
    },
    destroy() {
      latest = null;
    },
  };
}
