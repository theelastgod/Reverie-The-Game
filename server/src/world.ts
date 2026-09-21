export const TICK_HZ = 20;
export const DT = 1 / TICK_HZ;
export const SPEED = 160;
export const WORLD_W = 28 * 48;
export const WORLD_H = 20 * 48;

export type Intent = { up: boolean; down: boolean; left: boolean; right: boolean };

export type Player = {
  id: string;
  x: number;
  y: number;
  guest: boolean;
  aura: number;
  bestand: number;
};

export function stepPlayer(p: Player, intent: Intent, dt: number): Player {
  let vx = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
  let vy = (intent.down ? 1 : 0) - (intent.up ? 1 : 0);
  const len = Math.hypot(vx, vy) || 1;
  vx = (vx / len) * SPEED;
  vy = (vy / len) * SPEED;
  let x = p.x + vx * dt;
  let y = p.y + vy * dt;
  x = Math.max(48, Math.min(WORLD_W - 48, x));
  y = Math.max(48, Math.min(WORLD_H - 48, y));
  return { ...p, x, y };
}

export function spawnGuest(id: string): Player {
  return { id, x: 48 * 4, y: 48 * 10, guest: true, aura: 0, bestand: 0 };
}
