import React from "react";
import { Composition } from "remotion";
import { BQ360Demo } from "./BQ360Demo";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BQ360Demo"
      component={BQ360Demo}
      durationInFrames={timeline.totalFrames}
      fps={timeline.fps}
      width={1920}
      height={1080}
    />
  );
};
