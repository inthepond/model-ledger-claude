import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CostBars, ContextChart, LedgerBars} from './Charts';
import {C, MONO} from './theme';
import {Appear, Terminal, TypeLine} from './Terminal';

const DUR = {
  title: 130,
  tiers: 190,
  criterion: 150,
  cost: 220,
  context: 250,
  fail: 200,
  ledger: 220,
  loop: 170,
  cta: 140,
};

export const INTRO_DURATION =
  DUR.title +
  DUR.tiers +
  DUR.criterion +
  DUR.cost +
  DUR.context +
  DUR.fail +
  DUR.ledger +
  DUR.loop +
  DUR.cta;

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

const Headline: React.FC<{at?: number; children: React.ReactNode}> = ({at = 5, children}) => (
  <FadeUp at={at}>
    <div style={{fontFamily: MONO, fontSize: 52, color: C.text, fontWeight: 700, textAlign: 'center'}}>
      {children}
    </div>
  </FadeUp>
);

const Caption: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => (
  <FadeUp at={at}>
    <div style={{fontFamily: MONO, fontSize: 27, color: C.dim, textAlign: 'center'}}>{children}</div>
  </FadeUp>
);

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
          <span style={{color: C.faint}}>$ </span>model-ledger-claude
        </div>
        <FadeUp at={45} style={{marginTop: 44}}>
          <div style={{fontSize: 40, color: C.dim}}>
            Route agent work to the cheapest executor that can do it reliably.
          </div>
        </FadeUp>
        <FadeUp at={78} style={{marginTop: 30}}>
          <div style={{fontSize: 28, color: C.faint}}>
            CLAUDE.md template · fail-loud delegate script · evidence ledger
          </div>
        </FadeUp>
      </div>
    </Scene>
  );
};

const TierCard: React.FC<{
  delay: number;
  tier: string;
  title: string;
  lines: string[];
  price: string;
}> = ({delay, tier, title, lines, price}) => {
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
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${C.text}`,
        borderRadius: 14,
        padding: '36px 36px 30px',
        fontFamily: MONO,
      }}
    >
      <div style={{fontSize: 24, color: C.faint, letterSpacing: 3}}>{tier}</div>
      <div style={{fontSize: 44, color: C.text, fontWeight: 700, marginTop: 10}}>{title}</div>
      {lines.map((l) => (
        <div key={l} style={{fontSize: 26, color: C.dim, marginTop: 14}}>
          {l}
        </div>
      ))}
      <div style={{fontSize: 26, color: C.text, marginTop: 22}}>{price}</div>
    </div>
  );
};

const TiersScene: React.FC = () => (
  <Scene dur={DUR.tiers}>
    <div style={{textAlign: 'center'}}>
      <Headline>Three tiers. Lowest viable wins.</Headline>
      <div style={{display: 'flex', gap: 40, marginTop: 60, justifyContent: 'center'}}>
        <TierCard
          delay={20}
          tier="TIER 0"
          title="Shell"
          lines={['tree · rg · git log', 'Deterministic facts']}
          price="$0"
        />
        <TierCard
          delay={40}
          tier="TIER 1"
          title="Delegate model"
          lines={['local-llm.sh', 'Mechanical text work']}
          price="cheap"
        />
        <TierCard
          delay={60}
          tier="TIER 2"
          title="Claude"
          lines={['Judgment · writing', 'Cross-file reasoning']}
          price="expensive"
        />
      </div>
      <div style={{marginTop: 54}}>
        <Caption at={110}>Move up a tier only with a clear reason.</Caption>
      </div>
    </div>
  </Scene>
);

const CriterionScene: React.FC = () => (
  <Scene dur={DUR.criterion}>
    <div style={{maxWidth: 1480, textAlign: 'center', fontFamily: MONO}}>
      <FadeUp at={5}>
        <div style={{fontSize: 34, color: C.faint}}>the only delegation criterion</div>
      </FadeUp>
      <FadeUp at={25} style={{marginTop: 48}}>
        <div style={{fontSize: 60, lineHeight: 1.5, color: C.dim}}>
          <span style={{color: C.text}}>"</span>
          If this output were wrong and I would not notice,{' '}
          <span
            style={{
              backgroundColor: C.text,
              color: C.bg,
              fontWeight: 700,
              padding: '2px 16px',
            }}
          >
            do not delegate it
          </span>
          .<span style={{color: C.text}}>"</span>
        </div>
      </FadeUp>
    </div>
  </Scene>
);

const CostScene: React.FC = () => (
  <Scene dur={DUR.cost}>
    <div style={{textAlign: 'center'}}>
      <Headline>One 200KB CI log. Three routes.</Headline>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 56, textAlign: 'left'}}>
        <CostBars start={25} />
      </div>
      <Caption at={130}>input cost across a 40-turn session · Claude Opus 5 pricing</Caption>
    </div>
  </Scene>
);

const ContextScene: React.FC = () => (
  <Scene dur={DUR.context}>
    <div style={{textAlign: 'center'}}>
      <Headline>What enters context is re-billed every turn.</Headline>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 40, textAlign: 'left'}}>
        <ContextChart />
      </div>
      <Caption at={150}>tokens in context across the session</Caption>
    </div>
  </Scene>
);

const FailLoudScene: React.FC = () => (
  <Scene dur={DUR.fail}>
    <div style={{textAlign: 'center'}}>
      <div style={{marginBottom: 50}}>
        <Headline>Fail loudly. Never return garbage.</Headline>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', textAlign: 'left'}}>
        <Terminal width={1560} title="local-llm.sh">
          <TypeLine start={20} text={'$ ./scripts/local-llm.sh "Summarize this diff" < huge.diff'} />
          <Appear at={78} bold>
            local-llm: input of 412008 chars exceeds limit 200000, chunk it first
          </Appear>
          <Appear at={96} color={C.faint}>
            exit 3
          </Appear>
          <Appear at={118} color={C.dim}>
            {'-> escalated to Tier 2 · logged to docs/model-ledger-auto.tsv'}
          </Appear>
        </Terminal>
      </div>
      <div style={{marginTop: 44}}>
        <Caption at={150}>exit codes · 2 usage · 3 too large · 4 failed or timed out · 5 empty</Caption>
      </div>
    </div>
  </Scene>
);

const LedgerScene: React.FC = () => (
  <Scene dur={DUR.ledger}>
    <div style={{textAlign: 'center'}}>
      <Headline>Your ledger shows where the cliff is.</Headline>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 50, textAlign: 'left'}}>
        <LedgerBars start={22} />
      </div>
      <div style={{marginTop: 40}}>
        <Caption at={155}>failure rate by input size · from docs/model-ledger-auto.tsv</Caption>
      </div>
    </div>
  </Scene>
);

const LoopNode: React.FC<{delay: number; label: string; sub: string}> = ({delay, label, sub}) => {
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
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${C.text}`,
        borderRadius: 12,
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
        <div style={{marginBottom: 56}}>
          <Headline>The calibration loop</Headline>
        </div>
        <div style={{display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center'}}>
          <LoopNode delay={15} label="RULES" sub="CLAUDE.md" />
          <span style={{fontFamily: MONO, fontSize: 44, color: C.faint, opacity: arrowOpacity(30)}}>
            {'->'}
          </span>
          <LoopNode delay={30} label="DELEGATE" sub="local-llm.sh" />
          <span style={{fontFamily: MONO, fontSize: 44, color: C.faint, opacity: arrowOpacity(45)}}>
            {'->'}
          </span>
          <LoopNode delay={45} label="LOG" sub="auto.tsv + ledger" />
          <span style={{fontFamily: MONO, fontSize: 44, color: C.faint, opacity: arrowOpacity(60)}}>
            {'->'}
          </span>
          <LoopNode delay={60} label="REVIEW" sub="ledger-stats.sh" />
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
              <path d="M 0 0 L 10 5 L 0 10 z" fill={C.text} />
            </marker>
          </defs>
          <path
            d="M 1400 12 C 1400 120, 160 120, 160 12"
            stroke={C.text}
            strokeWidth={4}
            fill="none"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 * (1 - p)}
            markerEnd={p > 0.97 ? 'url(#loop-arrow)' : undefined}
          />
        </svg>
        <FadeUp at={128}>
          <div style={{fontFamily: MONO, fontSize: 28, color: C.dim}}>
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
          color={C.dim}
        />
      </div>
      <FadeUp at={100} style={{marginTop: 36}}>
        <div style={{fontSize: 28, color: C.faint}}>MIT licensed · plain shell · CI-tested</div>
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
      <Sequence {...seq(DUR.cost)}>
        <CostScene />
      </Sequence>
      <Sequence {...seq(DUR.context)}>
        <ContextScene />
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
