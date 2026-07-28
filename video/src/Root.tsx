import React from 'react';
import {Composition} from 'remotion';
import {DemoGif, GIF_DURATION} from './DemoGif';
import {Intro, INTRO_DURATION} from './Intro';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="intro"
      component={Intro}
      durationInFrames={INTRO_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="gif"
      component={DemoGif}
      durationInFrames={GIF_DURATION}
      fps={30}
      width={800}
      height={450}
    />
  </>
);
