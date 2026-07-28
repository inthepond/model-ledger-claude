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

const Panel: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, dur - 9, dur - 1], [0, 1, 1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity, justifyContent: 'center', alignItems: 'center'}}>
      {children}
    </AbsoluteFill>
  );
};

const Chip: React.FC<{delay: number; accent: string; children: React.ReactNode}> = ({
  delay,
  accent,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${(1 - s) * 18}px)`,
        backgroundColor: C.panel,
        border: `1px solid ${C.panelBorder}`,
        borderTop: `4px solid ${accent}`,
        borderRadius: 10,
        padding: '14px 18px',
        fontFamily: MONO,
        fontSize: 19,
        color: C.text,
        textAlign: 'center',
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
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
          <span style={{color: C.green}}>$ </span>model-ledger-claude
        </div>
        <div style={{fontSize: 21, color: C.dim, marginTop: 20, opacity: sub}}>
          Route agent work to the cheapest reliable executor.
        </div>
      </div>
    </Panel>
  );
};

const TiersPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const head = interpolate(frame, [3, 15], [0, 1], CLAMP);
  return (
    <Panel dur={90}>
      <div style={{textAlign: 'center'}}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 26,
            color: C.text,
            fontWeight: 700,
            opacity: head,
            marginBottom: 28,
          }}
        >
          Three tiers. Lowest viable wins.
        </div>
        <div style={{display: 'flex', gap: 18, justifyContent: 'center'}}>
          <Chip delay={12} accent={C.green}>
            <span style={{color: C.green}}>TIER 0</span>
            <br />
            shell · $0
          </Chip>
          <Chip delay={26} accent={C.amber}>
            <span style={{color: C.amber}}>TIER 1</span>
            <br />
            delegate model
          </Chip>
          <Chip delay={40} accent={C.blue}>
            <span style={{color: C.blue}}>TIER 2</span>
            <br />
            Claude
          </Chip>
        </div>
      </div>
    </Panel>
  );
};

const CriterionPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [5, 20], [0, 1], CLAMP);
  return (
    <Panel dur={75}>
      <div
        style={{
          maxWidth: 660,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 28,
          lineHeight: 1.5,
          color: C.text,
          opacity: t,
        }}
      >
        <span style={{color: C.amber}}>"</span>
        If it were wrong and you would not notice, <span style={{color: C.amber}}>do not delegate it</span>.
        <span style={{color: C.amber}}>"</span>
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
        <div style={{fontSize: 27, color: C.blue, opacity: t}}>
          github.com/inthepond/model-ledger-claude
        </div>
        <div style={{fontSize: 18, color: C.dim, marginTop: 16, opacity: sub}}>
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
    <Sequence from={80} durationInFrames={90}>
      <TiersPanel />
    </Sequence>
    <Sequence from={170} durationInFrames={75}>
      <CriterionPanel />
    </Sequence>
    <Sequence from={245} durationInFrames={55}>
      <CtaPanel />
    </Sequence>
  </AbsoluteFill>
);
