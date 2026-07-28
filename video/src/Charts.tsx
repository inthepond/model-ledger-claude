import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO} from './theme';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Horizontal bars: the same task routed through the three tiers.
// Single measure, single hue; values direct-labeled at the data end.
export const CostBars: React.FC<{start?: number}> = ({start = 20}) => {
  const frame = useCurrentFrame();
  const rows = [
    {label: 'Tier 0 · grep the log', value: 0.0, text: '$0.00'},
    {label: 'Tier 1 · send the digest', value: 0.011, text: '$0.01'},
    {label: 'Tier 2 · paste the log', value: 1.13, text: '$1.13'},
  ];
  const max = 1.13;
  const plotW = 1060;
  return (
    <div style={{width: plotW + 260, fontFamily: MONO}}>
      {rows.map((r, i) => {
        const p = easeOut(interpolate(frame, [start + i * 24, start + i * 24 + 42], [0, 1], CLAMP));
        const w = Math.max(4, (r.value / max) * plotW * p);
        const shown = r.value === 0 ? '$0.00' : `$${(r.value * p).toFixed(2)}`;
        return (
          <div key={r.label} style={{marginBottom: 42, opacity: interpolate(frame, [start + i * 24 - 6, start + i * 24 + 6], [0, 1], CLAMP)}}>
            <div style={{fontSize: 27, color: C.dim, marginBottom: 12}}>{r.label}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <div style={{borderLeft: `1px solid ${C.border}`, paddingLeft: 0}}>
                <div
                  style={{
                    width: w,
                    height: 40,
                    backgroundColor: C.text,
                    borderRadius: '0 4px 4px 0',
                  }}
                />
              </div>
              <div style={{fontSize: 33, color: C.text, fontWeight: 700, minWidth: 130}}>
                {p > 0.05 ? (r.text === '$1.13' ? shown : r.text) : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Two-series line chart: tokens in context across a 40-turn session.
// Monochrome, so identity is carried by dash pattern + direct end labels,
// never by color alone. One axis; recessive grid.
export const ContextChart: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1500;
  const H = 560;
  const L = 110;
  const R = 300;
  const T = 34;
  const B = 66;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const yMax = 60000;
  const x = (t: number) => L + ((t - 1) / 39) * plotW;
  const y = (v: number) => T + plotH - (v / yMax) * plotH;

  const turns = Array.from({length: 40}, (_, i) => i + 1);
  const paste = turns.map((t) => ({t, v: 2500 + t * 90 + (t >= 5 ? 50000 : 0)}));
  const digest = turns.map((t) => ({t, v: 2500 + t * 90 + (t >= 5 ? 500 : 0)}));

  const toPath = (pts: {t: number; v: number}[]) =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');

  const p = interpolate(frame, [15, 90], [0, 1], CLAMP);
  const labels = interpolate(frame, [92, 106], [0, 1], CLAMP);
  const marker = interpolate(frame, [40, 52], [0, 1], CLAMP);

  const pasteEnd = paste[paste.length - 1];
  const digestEnd = digest[digest.length - 1];
  const areaPath = `${toPath(paste)} L${x(40).toFixed(1)},${y(0).toFixed(1)} L${x(1).toFixed(1)},${y(0).toFixed(1)} Z`;

  return (
    <div style={{fontFamily: MONO}}>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 44, width: W, marginBottom: 6}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 12, color: C.dim, fontSize: 24}}>
          <span style={{width: 34, height: 0, borderTop: `3px solid ${C.text}`}} />
          paste the log
        </span>
        <span style={{display: 'flex', alignItems: 'center', gap: 12, color: C.dim, fontSize: 24}}>
          <span style={{width: 34, height: 0, borderTop: `3px dashed ${C.gray}`}} />
          send the digest
        </span>
      </div>
      <svg width={W} height={H}>
        <defs>
          <clipPath id="draw">
            <rect x={L - 2} y={0} width={(plotW + 8) * p} height={H} />
          </clipPath>
        </defs>
        {[0, 20000, 40000, 60000].map((v) => (
          <g key={v}>
            <line x1={L} y1={y(v)} x2={L + plotW} y2={y(v)} stroke={C.grid} strokeWidth={1} />
            <text x={L - 16} y={y(v) + 8} fill={C.faint} fontSize={22} fontFamily={MONO} textAnchor="end">
              {v === 0 ? '0' : `${v / 1000}k`}
            </text>
          </g>
        ))}
        {[1, 10, 20, 30, 40].map((t) => (
          <text key={t} x={x(t)} y={T + plotH + 38} fill={C.faint} fontSize={22} fontFamily={MONO} textAnchor="middle">
            {t}
          </text>
        ))}
        <text x={L + plotW / 2} y={H - 4} fill={C.faint} fontSize={22} fontFamily={MONO} textAnchor="middle">
          turn
        </text>
        <g opacity={marker}>
          <line x1={x(5)} y1={T} x2={x(5)} y2={T + plotH} stroke={C.border} strokeWidth={1} strokeDasharray="4 6" />
          <text x={x(5) + 12} y={T + 24} fill={C.dim} fontSize={22} fontFamily={MONO}>
            the log enters here
          </text>
        </g>
        <g clipPath="url(#draw)">
          <path d={areaPath} fill={C.text} opacity={0.07} />
          <path d={toPath(paste)} stroke={C.text} strokeWidth={3} fill="none" />
          <path d={toPath(digest)} stroke={C.gray} strokeWidth={3} fill="none" strokeDasharray="10 8" />
        </g>
        <g opacity={labels}>
          <text x={x(40) + 16} y={y(pasteEnd.v) + 8} fill={C.text} fontSize={26} fontFamily={MONO} fontWeight={700}>
            56k tokens
          </text>
          <text x={x(40) + 16} y={y(digestEnd.v) + 8} fill={C.dim} fontSize={26} fontFamily={MONO}>
            6k tokens
          </text>
        </g>
      </svg>
    </div>
  );
};

// Vertical bars: failure rate by input-size bucket, from the auto-log.
export const LedgerBars: React.FC<{start?: number}> = ({start = 15}) => {
  const frame = useCurrentFrame();
  const bars = [
    {label: 'under 10k', v: 1},
    {label: '10k to 50k', v: 4},
    {label: '50k to 100k', v: 24},
  ];
  const maxH = 330;
  const note = interpolate(frame, [start + 95, start + 110], [0, 1], CLAMP);
  return (
    <div style={{fontFamily: MONO, display: 'flex', alignItems: 'flex-end', gap: 60}}>
      <div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 110, borderBottom: `1px solid ${C.border}`, padding: '0 40px'}}>
          {bars.map((b, i) => {
            const p = easeOut(interpolate(frame, [start + i * 22, start + i * 22 + 40], [0, 1], CLAMP));
            const h = Math.max(4, (b.v / 24) * maxH * p);
            return (
              <div key={b.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
                <div style={{fontSize: 36, color: C.text, fontWeight: 700}}>
                  {p > 0.05 ? `${Math.round(b.v * p)}%` : ''}
                </div>
                <div style={{width: 150, height: h, backgroundColor: C.text, borderRadius: '4px 4px 0 0'}} />
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', gap: 110, padding: '16px 40px 0'}}>
          {bars.map((b) => (
            <div key={b.label} style={{width: 150, textAlign: 'center', fontSize: 24, color: C.dim}}>
              {b.label}
            </div>
          ))}
        </div>
        <div style={{textAlign: 'center', fontSize: 22, color: C.faint, marginTop: 12}}>
          input size (chars)
        </div>
      </div>
      <div style={{opacity: note, paddingBottom: 120, maxWidth: 420}}>
        <div style={{fontSize: 30, color: C.text, fontWeight: 700}}>the cliff</div>
        <div style={{fontSize: 26, color: C.dim, marginTop: 12, lineHeight: 1.5}}>
          tune LOCAL_LLM_MAX_CHARS, keep the model
        </div>
      </div>
    </div>
  );
};
