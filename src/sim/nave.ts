export const TILE = 48;
export const COLS = 28;
export const ROWS = 20;
export const BODY_R = 12;

export function isWallTile(tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  if (tx === 0 || ty === 0 || tx === COLS - 1 || ty === ROWS - 1) return true;
  const aisle = tx === 9 || tx === 18;
  return aisle && ty > 3 && ty < ROWS - 3 && ty % 4 !== 0;
}

export function circleHitsWalls(x: number, y: number, r = BODY_R): boolean {
  const minTx = Math.floor((x - r) / TILE);
  const maxTx = Math.floor((x + r) / TILE);
  const minTy = Math.floor((y - r) / TILE);
  const maxTy = Math.floor((y + r) / TILE);
  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      if (!isWallTile(tx, ty)) continue;
      const left = tx * TILE;
      const top = ty * TILE;
      const cx = Math.max(left, Math.min(x, left + TILE));
      const cy = Math.max(top, Math.min(y, top + TILE));
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy < r * r) return true;
    }
  }
  return false;
}

export type YieldNode = {
  id: string;
  x: number;
  y: number;
  depleted: boolean;
  kept: boolean;
};

export function naveNodes(): YieldNode[] {
  return [
    { id: "nave-node-1", x: 120, y: 180, depleted: false, kept: false },
    { id: "nave-node-2", x: 400, y: 180, depleted: false, kept: false },
    { id: "nave-node-3", x: 680, y: 180, depleted: false, kept: false },
  ];
}

export function nearNode(px: number, py: number, n: YieldNode, reach = 40): boolean {
  const dx = px - n.x;
  const dy = py - n.y;
  return dx * dx + dy * dy <= reach * reach;
}
