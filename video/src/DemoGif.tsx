import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, MONO} from './theme';

export const GIF_DURATION = 300;

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const Panel: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, dur - 9, dur - 1], [0, 1, 1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity, justifyContent: 'center', alignItems: 'center'}}>
      {children}
    </AbsoluteFill>
  );
};

const TitlePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 3, fps, config: {damping: 200}});
  const sub = interpolate(frame, [28, 42], [0, 1], CLAMP);
  return (
    <Panel dur={80}>
      <div style={{textAlign: 'center', fontFamily: MONO}}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: C.text,
            opacity: s,
            transform: `scale(${0.94 + s * 0.06})`,
          }}
        >
          <span style={{color: C.faint}}>$ </span>model-ledger-claude
        </div>
        <div style={{fontSize: 21, color: C.dim, marginTop: 20, opacity: sub}}>
          Route agent work to the cheapest reliable executor.
        </div>
      </div>
    </Panel>
  );
};

const CostPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const head = interpolate(frame, [3, 15], [0, 1], CLAMP);
  const rows = [
    {label: 'Tier 0 · grep', text: '$0.00', w: 4},
    {label: 'Tier 1 · digest', text: '$0.01', w: 10},
    {label: 'Tier 2 · paste', text: '$1.13', w: 380},
  ];
  return (
    <Panel dur={95}>
      <div style={{fontFamily: MONO}}>
        <div
          style={{
            fontSize: 25,
            color: C.text,
            fontWeight: 700,
            opacity: head,
            textAlign: 'center',
            marginBottom: 30,
          }}
        >
          Same 200KB log. Three routes.
        </div>
        {rows.map((r, i) => {
          const p = easeOut(interpolate(frame, [16 + i * 14, 16 + i * 14 + 28], [0, 1], CLAMP));
          return (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 18,
                opacity: interpolate(frame, [12 + i * 14, 20 + i * 14], [0, 1], CLAMP),
              }}
            >
              <div style={{width: 190, fontSize: 19, color: C.dim, textAlign: 'right'}}>{r.label}</div>
              <div
                style={{
                  width: Math.max(3, r.w * p),
                  height: 20,
                  backgroundColor: C.text,
                  borderRadius: '0 3px 3px 0',
                }}
              />
              <div style={{fontSize: 20, color: C.text, fontWeight: 700}}>{p > 0.4 ? r.text : ''}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

const CriterionPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [5, 20], [0, 1], CLAMP);
  return (
    <Panel dur={70}>
      <div
        style={{
          maxWidth: 680,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 27,
          lineHeight: 1.6,
          color: C.dim,
          opacity: t,
        }}
      >
        <span style={{color: C.text}}>"</span>
        If it were wrong and you would not notice,{' '}
        <span style={{backgroundColor: C.text, color: C.bg, fontWeight: 700, padding: '0 8px'}}>
          do not delegate it
        </span>
        .<span style={{color: C.text}}>"</span>
      </div>
    </Panel>
  );
};

const CtaPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [4, 16], [0, 1], CLAMP);
  const sub = interpolate(frame, [18, 30], [0, 1], CLAMP);
  return (
    <Panel dur={55}>
      <div style={{textAlign: 'center', fontFamily: MONO}}>
        <div style={{fontSize: 27, color: C.text, opacity: t}}>
          github.com/inthepond/model-ledger-claude
        </div>
        <div style={{fontSize: 18, color: C.faint, marginTop: 16, opacity: sub}}>
          MIT · plain shell · evidence ledger included
        </div>
      </div>
    </Panel>
  );
};

export const DemoGif: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <Sequence durationInFrames={80}>
      <TitlePanel />
    </Sequence>
    <Sequence from={80} durationInFrames={95}>
      <CostPanel />
    </Sequence>
    <Sequence from={175} durationInFrames={70}>
      <CriterionPanel />
    </Sequence>
    <Sequence from={245} durationInFrames={55}>
      <CtaPanel />
    </Sequence>
  </AbsoluteFill>
);
