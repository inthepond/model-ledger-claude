import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO} from './theme';

const Dot: React.FC<{color: string}> = ({color}) => (
  <span style={{width: 14, height: 14, borderRadius: 7, backgroundColor: color, display: 'inline-block'}} />
);

export const Terminal: React.FC<{
  width: number;
  title?: string;
  fontSize?: number;
  children: React.ReactNode;
}> = ({width, title = 'zsh', fontSize = 30, children}) => (
  <div
    style={{
      width,
      backgroundColor: C.panel,
      border: `2px solid ${C.panelBorder}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 20px',
        borderBottom: `2px solid ${C.panelBorder}`,
      }}
    >
      <Dot color={C.red} />
      <Dot color={C.amber} />
      <Dot color={C.green} />
      <span style={{marginLeft: 12, color: C.dim, fontFamily: MONO, fontSize: fontSize * 0.6}}>{title}</span>
    </div>
    <div
      style={{
        padding: '28px 34px',
        fontFamily: MONO,
        fontSize,
        lineHeight: 1.65,
        color: C.text,
        whiteSpace: 'pre-wrap',
      }}
    >
      {children}
    </div>
  </div>
);

export const TypeLine: React.FC<{
  text: string;
  start: number;
  cps?: number;
  color?: string;
}> = ({text, start, cps = 38, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chars = Math.max(0, Math.floor(((frame - start) * cps) / fps));
  const visible = text.slice(0, chars);
  const typing = frame >= start && chars < text.length;
  return (
    <div style={{color, minHeight: '1.65em'}}>
      {visible}
      {typing ? <span style={{color: C.green}}>█</span> : null}
    </div>
  );
};

export const Appear: React.FC<{
  at: number;
  color?: string;
  children: React.ReactNode;
}> = ({at, color, children}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{opacity: o, color, minHeight: '1.65em'}}>{children}</div>;
};
