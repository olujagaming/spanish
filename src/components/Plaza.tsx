/**
 * The learner's plaza: a small floating island drawn in isometric SVG.
 * Buildings appear when a stage (unit) is completed; decorations are bought with reales.
 */

import type { ReactNode } from 'react';
import {
  BUILDINGS,
  DECO_SLOTS,
  FOUNTAIN,
  isUnitComplete,
  type Building,
  type DecoShape,
} from '../lib/progression';
import type { AppState } from '../lib/state';

const W = 400;
const H = 366;
const TW = 38; // half tile width
const TH = 19; // half tile height
const X0 = W / 2;
const Y0 = 152;

function tile(row: number, col: number) {
  return { x: X0 + (col - row) * TW, y: Y0 + (col + row) * TH };
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `rgb(${r},${g},${b})`;
}

const pts = (...p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** An isometric box with its footprint centred on (cx, cy). Returns the top-face points. */
function box(cx: number, cy: number, a: number, b: number, h: number, color: string, key: string): ReactNode {
  const L: [number, number] = [cx - a, cy];
  const B: [number, number] = [cx, cy + b];
  const R: [number, number] = [cx + a, cy];
  const T: [number, number] = [cx, cy - b];
  const up = (p: [number, number]): [number, number] => [p[0], p[1] - h];
  return (
    <g key={key}>
      <polygon points={pts(L, B, up(B), up(L))} fill={shade(color, -0.28)} />
      <polygon points={pts(B, R, up(R), up(B))} fill={shade(color, -0.1)} />
      <polygon points={pts(up(T), up(R), up(B), up(L))} fill={shade(color, 0.08)} />
    </g>
  );
}

function windowsFor(cx: number, cy: number, a: number, b: number, h: number, light: string, floors: number): ReactNode[] {
  const out: ReactNode[] = [];
  const ww = a * 0.22;
  for (let f = 0; f < floors; f++) {
    const lift = h * ((f + 0.55) / (floors + 0.3));
    // left face windows
    for (const t of [0.3, 0.68]) {
      const x = cx - a + a * t;
      const y = cy + b * t - lift;
      out.push(<polygon key={`l${f}${t}`} points={pts([x, y], [x + ww, y + ww / 2], [x + ww, y + ww / 2 - 7], [x, y - 7])} fill={light} opacity={0.9} />);
    }
    // right face windows
    for (const t of [0.32, 0.7]) {
      const x = cx + a * t;
      const y = cy + b - b * t - lift;
      out.push(<polygon key={`r${f}${t}`} points={pts([x - ww, y + ww / 2], [x, y], [x, y - 7], [x - ww, y + ww / 2 - 7])} fill={light} opacity={0.9} />);
    }
  }
  return out;
}

function BuildingShape({ b, light }: { b: Building; light: string }) {
  const { x, y } = tile(b.row, b.col);
  const a = TW * 0.7;
  const bb = TH * 0.7;
  const h = b.height;
  const top = y - h;
  const parts: ReactNode[] = [box(x, y, a, bb, h, b.color, 'body')];
  parts.push(...windowsFor(x, y, a, bb, h, light, h > 32 ? 2 : 1));
  // door on the right face
  parts.push(
    <polygon key="door" points={pts([x + a * 0.25, y + bb * 0.75], [x + a * 0.42, y + bb * 0.58], [x + a * 0.42, y + bb * 0.58 - 10], [x + a * 0.25, y + bb * 0.75 - 10])} fill={shade(b.roofColor, -0.35)} />,
  );
  if (b.roof === 'pyramid') {
    const apex: [number, number] = [x, top - bb - 14];
    parts.push(
      <polygon key="r1" points={pts([x - a, top], [x, top + bb], apex)} fill={shade(b.roofColor, -0.2)} />,
      <polygon key="r2" points={pts([x, top + bb], [x + a, top], apex)} fill={b.roofColor} />,
    );
  } else if (b.roof === 'flat') {
    parts.push(<polygon key="r" points={pts([x, top - bb], [x + a, top], [x, top + bb], [x - a, top])} fill={b.roofColor} />);
    parts.push(<polygon key="aw" points={pts([x, top + bb], [x + a, top], [x + a + 3, top + 6], [x + 3, top + bb + 6])} fill={shade(b.roofColor, 0.15)} opacity={0.85} />);
  } else if (b.roof === 'dome') {
    const rx = a * 0.62;
    parts.push(
      <ellipse key="base" cx={x} cy={top} rx={rx} ry={rx / 2} fill={shade(b.roofColor, -0.25)} />,
      <path key="dome" d={`M${x - rx},${top} A${rx},${rx * 0.95} 0 0 1 ${x + rx},${top} A${rx},${rx / 2} 0 0 1 ${x - rx},${top} Z`} fill={b.roofColor} />,
      <line key="spire" x1={x} y1={top - rx * 0.95} x2={x} y2={top - rx * 0.95 - 7} stroke={shade(b.roofColor, 0.3)} strokeWidth={1.5} />,
    );
  } else {
    // tower: small box on top with a pointed roof
    const ta = a * 0.42;
    const tb = bb * 0.42;
    const th = 16;
    parts.push(<polygon key="ttop" points={pts([x, top - bb], [x + a, top], [x, top + bb], [x - a, top])} fill={shade(b.color, 0.05)} />);
    parts.push(box(x, top, ta, tb, th, b.color, 'tower'));
    parts.push(<circle key="clock" cx={x + ta * 0.5} cy={top - th * 0.5} r={3} fill={light} opacity={0.9} />);
    const t2 = top - th;
    const apex: [number, number] = [x, t2 - tb - 14];
    parts.push(
      <polygon key="tr1" points={pts([x - ta, t2], [x, t2 + tb], apex)} fill={shade(b.roofColor, -0.2)} />,
      <polygon key="tr2" points={pts([x, t2 + tb], [x + ta, t2], apex)} fill={b.roofColor} />,
    );
  }
  return <>{parts}</>;
}

function LockedPlot({ row, col }: { row: number; col: number }) {
  const { x, y } = tile(row, col);
  const a = TW * 0.7;
  const b = TH * 0.7;
  return (
    <g opacity={0.55}>
      <polygon points={pts([x, y - b], [x + a, y], [x, y + b], [x - a, y])} fill="none" stroke="currentColor" strokeDasharray="3 3" strokeWidth={1} />
      <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="currentColor" strokeWidth={1} />
      <line x1={x} y1={y - 3} x2={x} y2={y + 3} stroke="currentColor" strokeWidth={1} />
    </g>
  );
}

export function DecoGraphic({ shape, x, y }: { shape: DecoShape; x: number; y: number }) {
  const shadow = <ellipse cx={x} cy={y + 2} rx={12} ry={5} fill="#000" opacity={0.25} />;
  switch (shape) {
    case 'maceta':
      return (
        <g>
          {shadow}
          <polygon points={pts([x - 7, y - 10], [x + 7, y - 10], [x + 5, y + 1], [x - 5, y + 1])} fill="#c4673f" />
          <circle cx={x} cy={y - 15} r={8} fill="#4f8a5b" />
          <circle cx={x - 3} cy={y - 17} r={2} fill="#ff8fa3" />
          <circle cx={x + 4} cy={y - 14} r={2} fill="#ffd166" />
          <circle cx={x + 1} cy={y - 20} r={2} fill="#ff8fa3" />
        </g>
      );
    case 'banco':
      return (
        <g>
          {shadow}
          <polygon points={pts([x - 14, y - 4], [x + 6, y - 14], [x + 10, y - 12], [x - 10, y - 2])} fill="#8a5a36" />
          <polygon points={pts([x - 14, y - 4], [x + 6, y - 14], [x + 6, y - 22], [x - 14, y - 12])} fill="#a06a40" />
          <line x1={x - 12} y1={y - 3} x2={x - 12} y2={y + 2} stroke="#3a2a20" strokeWidth={1.5} />
          <line x1={x + 8} y1={y - 12} x2={x + 8} y2={y - 7} stroke="#3a2a20" strokeWidth={1.5} />
        </g>
      );
    case 'farola':
      return (
        <g>
          {shadow}
          <circle cx={x} cy={y - 34} r={13} fill="url(#lampGlow)" />
          <line x1={x} y1={y} x2={x} y2={y - 30} stroke="#2c3040" strokeWidth={2} />
          <polygon points={pts([x - 4, y - 30], [x + 4, y - 30], [x + 3, y - 38], [x - 3, y - 38])} fill="#ffe2a1" stroke="#2c3040" strokeWidth={1} />
          <polygon points={pts([x - 5, y - 38], [x + 5, y - 38], [x, y - 42])} fill="#2c3040" />
        </g>
      );
    case 'gato':
      return (
        <g>
          {shadow}
          <ellipse cx={x} cy={y - 5} rx={7} ry={5} fill="#e08a3c" />
          <circle cx={x + 6} cy={y - 11} r={4} fill="#e08a3c" />
          <polygon points={pts([x + 3, y - 14], [x + 4, y - 18], [x + 6, y - 14])} fill="#e08a3c" />
          <polygon points={pts([x + 6, y - 14], [x + 8, y - 18], [x + 9, y - 13])} fill="#e08a3c" />
          <path d={`M${x - 7},${y - 5} q-6,-2 -4,-10`} stroke="#e08a3c" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'naranjo':
      return (
        <g>
          {shadow}
          <rect x={x - 1.5} y={y - 14} width={3} height={14} fill="#6b4a2f" />
          <circle cx={x} cy={y - 22} r={11} fill="#3f7d4e" />
          <circle cx={x - 4} cy={y - 26} r={7} fill="#4c9160" />
          {[
            [-5, -20],
            [4, -24],
            [2, -17],
            [-2, -28],
            [6, -19],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={x + dx} cy={y + dy} r={1.8} fill="#ffa53a" />
          ))}
        </g>
      );
    case 'cactus':
      return (
        <g>
          {shadow}
          <rect x={x - 4} y={y - 26} width={8} height={26} rx={4} fill="#4f9a63" />
          <path d={`M${x - 4},${y - 12} h-5 v-8`} stroke="#4f9a63" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M${x + 4},${y - 16} h5 v-6`} stroke="#4f9a63" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={x} cy={y - 27} r={2} fill="#ff6fa0" />
        </g>
      );
    case 'cipres':
      return (
        <g>
          {shadow}
          <ellipse cx={x} cy={y - 20} rx={6} ry={20} fill="#2f5d43" />
          <ellipse cx={x - 1.5} cy={y - 24} rx={3} ry={13} fill="#3b7253" />
        </g>
      );
    case 'sombrilla':
      return (
        <g>
          {shadow}
          <line x1={x} y1={y - 2} x2={x} y2={y - 26} stroke="#ddd" strokeWidth={1.5} />
          <ellipse cx={x} cy={y - 8} rx={8} ry={4} fill="#efe6d6" />
          <path d={`M${x - 16},${y - 22} Q${x},${y - 38} ${x + 16},${y - 22} Z`} fill="#e2725b" />
          <path d={`M${x - 6},${y - 27} Q${x},${y - 38} ${x + 6},${y - 27}`} fill="#f4ead8" opacity={0.9} />
        </g>
      );
    case 'palmera':
      return (
        <g>
          {shadow}
          <path d={`M${x},${y} q3,-16 -2,-34`} stroke="#8a6440" strokeWidth={4} fill="none" strokeLinecap="round" />
          {[-60, -20, 20, 60, 100].map((ang, i) => {
            const r = (ang * Math.PI) / 180;
            const ex = x - 2 + Math.cos(r - Math.PI / 2) * 16;
            const ey = y - 34 + Math.sin(r - Math.PI / 2) * 9 + 6;
            return <path key={i} d={`M${x - 2},${y - 34} Q${(x - 2 + ex) / 2},${y - 44} ${ex},${ey}`} stroke="#3f8a55" strokeWidth={3.5} fill="none" strokeLinecap="round" />;
          })}
        </g>
      );
    case 'banderines': {
      const colors = ['#e2725b', '#e8b65a', '#5cc9a3', '#7d8cff', '#ff8fa3'];
      return (
        <g>
          {shadow}
          <line x1={x - 16} y1={y + 2} x2={x - 16} y2={y - 30} stroke="#6b4a2f" strokeWidth={1.5} />
          <line x1={x + 16} y1={y - 6} x2={x + 16} y2={y - 38} stroke="#6b4a2f" strokeWidth={1.5} />
          <path d={`M${x - 16},${y - 29} Q${x},${y - 22} ${x + 16},${y - 37}`} stroke="#ddd" strokeWidth={0.8} fill="none" />
          {colors.map((c, i) => {
            const t = (i + 0.5) / colors.length;
            const px = x - 16 + 32 * t;
            const py = y - 29 + (-8 * t) + 7 * Math.sin(Math.PI * t) * 0.9 - 0;
            return <polygon key={i} points={pts([px - 3, py], [px + 3, py - 1], [px + 0.5, py + 7])} fill={c} />;
          })}
        </g>
      );
    }
    case 'carreta':
      return (
        <g>
          {shadow}
          <polygon points={pts([x - 14, y - 6], [x + 8, y - 16], [x + 8, y - 24], [x - 14, y - 14])} fill="#9c6b3f" />
          <polygon points={pts([x + 8, y - 16], [x + 14, y - 13], [x + 14, y - 21], [x + 8, y - 24])} fill="#7a5230" />
          <circle cx={x - 8} cy={y - 4} r={4.5} fill="none" stroke="#3a2a20" strokeWidth={1.8} />
          {[
            [-9, -18, '#ff8fa3'],
            [-3, -21, '#ffd166'],
            [3, -24, '#e2725b'],
            [-5, -25, '#c58cff'],
            [6, -20, '#ff8fa3'],
          ].map(([dx, dy, c], i) => (
            <circle key={i} cx={x + (dx as number)} cy={y + (dy as number)} r={2.6} fill={c as string} />
          ))}
        </g>
      );
    case 'estatua':
      return (
        <g>
          {shadow}
          {box(x, y, 9, 4.5, 12, '#bdb5a6', 'ped')}
          <circle cx={x} cy={y - 36} r={3.5} fill="#e8b65a" />
          <path d={`M${x - 4},${y - 15} L${x - 3},${y - 31} L${x + 3},${y - 31} L${x + 4},${y - 15} Z`} fill="#e8b65a" />
          <path d={`M${x + 3},${y - 30} l7,-8`} stroke="#e8b65a" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      );
  }
}

function Fountain() {
  const { x, y } = tile(FOUNTAIN.row, FOUNTAIN.col);
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={26} ry={13} fill="#000" opacity={0.2} />
      <ellipse cx={x} cy={y} rx={24} ry={12} fill="#cbbfa8" />
      <ellipse cx={x} cy={y - 3} rx={24} ry={12} fill="#ddd2bd" />
      <ellipse cx={x} cy={y - 3} rx={19} ry={9.5} fill="#5aa7c9" />
      <ellipse cx={x - 4} cy={y - 5} rx={8} ry={3} fill="#9fd6ec" opacity={0.6} />
      <rect x={x - 2.5} y={y - 22} width={5} height={19} fill="#ddd2bd" />
      <ellipse cx={x} cy={y - 22} rx={8} ry={4} fill="#ddd2bd" />
      <path d={`M${x},${y - 24} q-8,-10 -14,6 M${x},${y - 24} q8,-10 14,6`} stroke="#9fd6ec" strokeWidth={1.6} fill="none" opacity={0.85} />
    </g>
  );
}

export function Plaza({
  state,
  editing,
  selectedSlot,
  onSlot,
  onBuilding,
  children,
}: {
  state: AppState;
  editing?: boolean;
  selectedSlot?: string | null;
  onSlot?: (slotId: string) => void;
  onBuilding?: (b: Building) => void;
  children?: ReactNode;
}) {
  const light = '#ffd98a';
  type Item = { depth: number; node: ReactNode };
  const items: Item[] = [];

  for (const b of BUILDINGS) {
    const built = isUnitComplete(state, b.unitId);
    items.push({
      depth: b.row + b.col,
      node: built ? (
        <g
          key={b.unitId}
          className="plaza-building"
          role="button"
          tabIndex={0}
          aria-label={`${b.name} – ${b.de}`}
          onClick={() => onBuilding?.(b)}
          onKeyDown={(e) => e.key === 'Enter' && onBuilding?.(b)}
        >
          <title>{`${b.name} · ${b.de}`}</title>
          <BuildingShape b={b} light={light} />
        </g>
      ) : (
        <LockedPlot key={b.unitId} row={b.row} col={b.col} />
      ),
    });
  }

  for (const slot of DECO_SLOTS) {
    const { x, y } = tile(slot.row, slot.col);
    const deco = state.plaza[slot.id] as DecoShape | undefined;
    const a = TW * 0.62;
    const bb = TH * 0.62;
    items.push({
      depth: slot.row + slot.col,
      node: (
        <g
          key={slot.id}
          className={`plaza-slot ${editing ? 'editing' : ''}`}
          onClick={() => editing && onSlot?.(slot.id)}
          role={editing ? 'button' : undefined}
          aria-label={editing ? `Platz ${slot.id}` : undefined}
        >
          {editing && (
            <polygon
              className="slot-ring"
              points={pts([x, y - bb], [x + a, y], [x, y + bb], [x - a, y])}
              fill={selectedSlot === slot.id ? 'rgba(232,182,90,0.25)' : 'rgba(255,255,255,0.04)'}
              stroke="rgba(232,182,90,0.7)"
              strokeWidth={1}
            />
          )}
          {deco && <DecoGraphic shape={deco} x={x} y={y} />}
          {editing && !deco && <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fill="#e8b65a">+</text>}
        </g>
      ),
    });
  }

  items.push({ depth: FOUNTAIN.row + FOUNTAIN.col, node: <Fountain key="fountain" /> });
  items.sort((p, q) => p.depth - q.depth);

  // Island: board top + earthy sides.
  const top = tile(0, 0);
  const right = tile(0, 4);
  const bottom = tile(4, 4);
  const left = tile(4, 0);
  const T: [number, number] = [top.x, top.y - TH];
  const R: [number, number] = [right.x + TW, right.y];
  const B: [number, number] = [bottom.x, bottom.y + TH];
  const L: [number, number] = [left.x - TW, left.y];
  const depth = 22;
  const down = (p: [number, number], d = depth): [number, number] => [p[0], p[1] + d];

  const tiles: ReactNode[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const { x, y } = tile(r, c);
      tiles.push(
        <polygon
          key={`${r}-${c}`}
          points={pts([x, y - TH], [x + TW, y], [x, y + TH], [x - TW, y])}
          fill={(r + c) % 2 ? '#d9cbb0' : '#e3d6bd'}
          stroke="#c2b190"
          strokeWidth={0.6}
        />,
      );
    }
  }

  const stars = [
    [30, 30],
    [80, 60],
    [150, 22],
    [250, 40],
    [330, 20],
    [370, 70],
    [55, 120],
    [345, 125],
    [20, 200],
    [385, 210],
  ];

  return (
    <div className="plaza-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Deine Plaza">
        <defs>
          <radialGradient id="lampGlow">
            <stop offset="0" stopColor="#ffd98a" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a5a3f" />
            <stop offset="1" stopColor="#3b2a22" />
          </linearGradient>
        </defs>
        <g className="stars-bg">
          {stars.map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={i % 3 ? 0.9 : 1.4} opacity={0.6} />
          ))}
        </g>
        {/* island underside */}
        <polygon points={pts(L, B, down(B), [B[0], B[1] + depth + 46], down(L, depth + 6))} fill="url(#earth)" opacity={0.95} />
        <polygon points={pts(B, R, down(R, depth + 6), [B[0], B[1] + depth + 46], down(B))} fill="#5b4232" />
        <polygon points={pts(L, B, down(B), down(L))} fill="#8b6a4a" />
        <polygon points={pts(B, R, down(R), down(B))} fill="#a07b55" />
        <polygon points={pts(L, B, down(B, 5), down(L, 5))} fill="#5f9a62" />
        <polygon points={pts(B, R, down(R, 5), down(B, 5))} fill="#6fae70" />
        <polygon points={pts(T, R, B, L)} fill="#6fae70" />
        {tiles}
        {items.map((i) => i.node)}
      </svg>
      {children}
    </div>
  );
}
