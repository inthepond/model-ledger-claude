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
import {Appear, Terminal, TypeLine} from './Terminal';

const DUR = {
  title: 150,
  tiers: 240,
  criterion: 180,
  fail: 240,
  ledger: 240,
  loop: 180,
  cta: 150,
};

export const INTRO_DURATION =
  DUR.title + DUR.tiers + DUR.criterion + DUR.fail + DUR.ledger + DUR.loop + DUR.cta;

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, dur - 14, dur - 2], [0, 1, 1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity, justifyContent: 'center', alignItems: 'center'}}>
      {children}
    </AbsoluteFill>
  );
};

const FadeUp: React.FC<{at: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  at,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 15], [0, 1], CLAMP);
  return (
    <div style={{opacity: t, transform: `translateY(${(1 - t) * 24}px)`, ...style}}>{children}</div>
  );
};

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 5, fps, config: {damping: 200}});
  return (
    <Scene dur={DUR.title}>
      <div style={{textAlign: 'center', fontFamily: MONO}}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: C.text,
            opacity: s,
            transform: `scale(${0.92 + s * 0.08})`,
          }}
        >
          <span style={{color: C.green}}>$ </span>model-ledger-claude
        </div>
        <FadeUp at={45} style={{marginTop: 44}}>
          <div style={{fontSize: 40, color: C.dim}}>
            Route agent work to the cheapest executor that can do it reliably.
          </div>
        </FadeUp>
        <FadeUp at={78} style={{marginTop: 30}}>
          <div style={{fontSize: 30, color: C.amber}}>
            CLAUDE.md template · fail-loud delegate script · evidence ledger
          </div>
        </FadeUp>
      </div>
    </Scene>
  );
};

const TierCard: React.FC<{
  delay: number;
  accent: string;
  tier: string;
  title: string;
  lines: string[];
  price: string;
}> = ({delay, accent, tier, title, lines, price}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        width: 470,
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
        backgroundColor: C.panel,
        border: `2px solid ${C.panelBorder}`,
        borderTop: `6px solid ${accent}`,
        borderRadius: 16,
        padding: '36px 36px 30px',
        fontFamily: MONO,
      }}
    >
      <div style={{fontSize: 25, color: accent, letterSpacing: 2}}>{tier}</div>
      <div style={{fontSize: 44, color: C.text, fontWeight: 700, marginTop: 10}}>{title}</div>
      {lines.map((l) => (
        <div key={l} style={{fontSize: 26, color: C.dim, marginTop: 14}}>
          {l}
        </div>
      ))}
      <div style={{fontSize: 26, color: accent, marginTop: 22}}>{price}</div>
    </div>
  );
};

const TiersScene: React.FC = () => (
  <Scene dur={DUR.tiers}>
    <div style={{textAlign: 'center'}}>
      <FadeUp at={5}>
        <div style={{fontFamily: MONO, fontSize: 52, color: C.text, fontWeight: 700}}>
          Three tiers. Lowest viable wins.
        </div>
      </FadeUp>
      <div style={{display: 'flex', gap: 40, marginTop: 60, justifyContent: 'center'}}>
        <TierCard
          delay={20}
          accent={C.green}
          tier="TIER 0"
          title="Shell"
          lines={['tree · rg · git log', 'Deterministic facts']}
          price="$0"
        />
        <TierCard
          delay={40}
          accent={C.amber}
          tier="TIER 1"
          title="Delegate model"
          lines={['local-llm.sh', 'Mechanical text work']}
          price="cheap"
        />
        <TierCard
          delay={60}
          accent={C.blue}
          tier="TIER 2"
          title="Claude"
          lines={['Judgment · writing', 'Cross-file reasoning']}
          price="expensive"
        />
      </div>
      <FadeUp at={110} style={{marginTop: 54}}>
        <div style={{fontFamily: MONO, fontSize: 30, color: C.dim}}>
          Move up a tier only with a clear reason.
        </div>
      </FadeUp>
    </div>
  </Scene>
);

const CriterionScene: React.FC = () => (
  <Scene dur={DUR.criterion}>
    <div style={{maxWidth: 1480, textAlign: 'center', fontFamily: MONO}}>
      <FadeUp at={5}>
        <div style={{fontSize: 36, color: C.dim}}>the only delegation criterion</div>
      </FadeUp>
      <FadeUp at={25} style={{marginTop: 44}}>
        <div style={{fontSize: 62, lineHeight: 1.45, color: C.text}}>
          <span style={{color: C.amber}}>"</span>
          If this output were wrong and I would not notice,{' '}
          <span style={{color: C.amber}}>do not delegate it</span>.
          <span style={{color: C.amber}}>"</span>
        </div>
      </FadeUp>
    </div>
  </Scene>
);

const FailLoudScene: React.FC = () => (
  <Scene dur={DUR.fail}>
    <div style={{textAlign: 'center'}}>
      <FadeUp at={5}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 52,
            color: C.text,
            fontWeight: 700,
            marginBottom: 50,
          }}
        >
          Fail loudly. Never return garbage.
        </div>
      </FadeUp>
      <div style={{display: 'flex', justifyContent: 'center', textAlign: 'left'}}>
        <Terminal width={1560} title="local-llm.sh">
          <TypeLine start={20} text={'$ ./scripts/local-llm.sh "Summarize this diff" < huge.diff'} />
          <Appear at={80} color={C.red}>
            local-llm: input of 412008 chars exceeds limit 200000, chunk it first
          </Appear>
          <Appear at={100} color={C.dim}>
            exit 3
          </Appear>
          <Appear at={125} color={C.green}>
            {'-> escalated to Tier 2 · logged to docs/model-ledger-auto.tsv'}
          </Appear>
        </Terminal>
      </div>
      <FadeUp at={160} style={{marginTop: 44}}>
        <div style={{fontFamily: MONO, fontSize: 28, color: C.dim}}>
          exit codes · 2 usage · 3 too large · 4 failed or timed out · 5 empty output
        </div>
      </FadeUp>
    </div>
  </Scene>
);

const LedgerScene: React.FC = () => (
  <Scene dur={DUR.ledger}>
    <div style={{textAlign: 'center'}}>
      <FadeUp at={5}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 52,
            color: C.text,
            fontWeight: 700,
            marginBottom: 50,
          }}
        >
          Evidence, not vibes.
        </div>
      </FadeUp>
      <div style={{display: 'flex', justifyContent: 'center', textAlign: 'left'}}>
        <Terminal width={1560} title="ledger-stats.sh">
          <TypeLine start={15} text="$ ./scripts/ledger-stats.sh" />
          <Appear at={50}>
            invocations: 214{'    '}successes: <span style={{color: C.green}}>197 (92%)</span>
          </Appear>
          <Appear at={64} color={C.dim}>
            by model:
          </Appear>
          <Appear at={74}>
            {'  '}kimi-k2.7-code:cloud{'        '}
            <span style={{color: C.green}}>197/210 ok (94%)</span>
          </Appear>
          <Appear at={88} color={C.dim}>
            failure rate by input size (chars):
          </Appear>
          <Appear at={98}>
            {'  '}50k to 100k{'    '}
            <span style={{color: C.amber}}>9/38 failed</span>
          </Appear>
        </Terminal>
      </div>
      <FadeUp at={140} style={{marginTop: 44}}>
        <div style={{fontFamily: MONO, fontSize: 28, color: C.dim}}>
          Every call logs itself. Reviews rewrite the rules at each model epoch.
        </div>
      </FadeUp>
    </div>
  </Scene>
);

const LoopNode: React.FC<{delay: number; accent: string; label: string; sub: string}> = ({
  delay,
  accent,
  label,
  sub,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        width: 330,
        opacity: s,
        transform: `translateY(${(1 - s) * 30}px)`,
        backgroundColor: C.panel,
        border: `2px solid ${C.panelBorder}`,
        borderTop: `5px solid ${accent}`,
        borderRadius: 14,
        padding: '26px 24px',
        fontFamily: MONO,
        textAlign: 'center',
      }}
    >
      <div style={{fontSize: 32, color: C.text, fontWeight: 700}}>{label}</div>
      <div style={{fontSize: 23, color: C.dim, marginTop: 10}}>{sub}</div>
    </div>
  );
};

const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [85, 125], [0, 1], CLAMP);
  const arrowOpacity = (at: number) => interpolate(frame, [at, at + 8], [0, 1], CLAMP);
  return (
    <Scene dur={DUR.loop}>
      <div style={{textAlign: 'center'}}>
        <FadeUp at={5}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 52,
              color: C.text,
              fontWeight: 700,
              marginBottom: 56,
            }}
          >
            The calibration loop
          </div>
        </FadeUp>
        <div style={{display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center'}}>
          <LoopNode delay={15} accent={C.blue} label="RULES" sub="CLAUDE.md" />
          <span style={{fontFamily: MONO, fontSize: 44, color: C.dim, opacity: arrowOpacity(30)}}>
            {'->'}
          </span>
          <LoopNode delay={30} accent={C.green} label="DELEGATE" sub="local-llm.sh" />
          <span style={{fontFamily: MONO, fontSize: 44, color: C.dim, opacity: arrowOpacity(45)}}>
            {'->'}
          </span>
          <LoopNode delay={45} accent={C.amber} label="LOG" sub="auto.tsv + ledger" />
          <span style={{fontFamily: MONO, fontSize: 44, color: C.dim, opacity: arrowOpacity(60)}}>
            {'->'}
          </span>
          <LoopNode delay={60} accent={C.red} label="REVIEW" sub="ledger-stats.sh" />
        </div>
        <svg width={1560} height={140} style={{marginTop: 8}}>
          <defs>
            <marker
              id="loop-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={C.amber} />
            </marker>
          </defs>
          <path
            d="M 1400 12 C 1400 120, 160 120, 160 12"
            stroke={C.amber}
            strokeWidth={5}
            fill="none"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 * (1 - p)}
            markerEnd={p > 0.97 ? 'url(#loop-arrow)' : undefined}
          />
        </svg>
        <FadeUp at={128}>
          <div style={{fontFamily: MONO, fontSize: 28, color: C.amber}}>
            the review rewrites the delegate lists
          </div>
        </FadeUp>
      </div>
    </Scene>
  );
};

const CtaScene: React.FC = () => (
  <Scene dur={DUR.cta}>
    <div style={{textAlign: 'center', fontFamily: MONO}}>
      <FadeUp at={8}>
        <div style={{fontSize: 66, color: C.text, fontWeight: 700}}>Calibrate, don't guess.</div>
      </FadeUp>
      <div style={{marginTop: 48, fontSize: 36}}>
        <TypeLine
          start={40}
          text="$ git clone https://github.com/inthepond/model-ledger-claude"
          color={C.blue}
        />
      </div>
      <FadeUp at={105} style={{marginTop: 36}}>
        <div style={{fontSize: 28, color: C.dim}}>MIT licensed · plain shell · CI-tested</div>
      </FadeUp>
    </div>
  </Scene>
);

export const Intro: React.FC = () => {
  let at = 0;
  const seq = (dur: number) => {
    const from = at;
    at += dur;
    return {from, durationInFrames: dur};
  };
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence {...seq(DUR.title)}>
        <TitleScene />
      </Sequence>
      <Sequence {...seq(DUR.tiers)}>
        <TiersScene />
      </Sequence>
      <Sequence {...seq(DUR.criterion)}>
        <CriterionScene />
      </Sequence>
      <Sequence {...seq(DUR.fail)}>
        <FailLoudScene />
      </Sequence>
      <Sequence {...seq(DUR.ledger)}>
        <LedgerScene />
      </Sequence>
      <Sequence {...seq(DUR.loop)}>
        <LoopScene />
      </Sequence>
      <Sequence {...seq(DUR.cta)}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};
