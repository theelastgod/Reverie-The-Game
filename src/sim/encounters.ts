import { CLERK_HP, type Clerk } from "./campaign";
import type { WorldState } from "./world";

export const INTAKE = { id: "clerk-intake", x: 312, y: 576 };
export const INTAKE_RECOVERY = 12;
export const CLERK_RECOVERY = 0.85;

/** A relief shift, not the resurrection of either authored clerk. One may exist at a time. */
export function refreshIntake(w: WorldState): WorldState {
  if (w.clerks.some(c => c.id === INTAKE.id) || w.now < (w.intakeReadyAt ?? 0)) return w;
  const arrival = [...w.players.values()].some(p => !p.locked && p.hp > 0 && !p.openingCombat && !p.beats.nara && !p.beats.under
    && Math.hypot(p.x - INTAKE.x, p.y - INTAKE.y) <= 200);
  if (!arrival) return w;
  const clerk: Clerk = { ...INTAKE, name: "Intake Clerk", hp: CLERK_HP * 2, maxHp: CLERK_HP * 2, telegraph: 0 };
  return { ...w, clerks: [...w.clerks, clerk] };
}
