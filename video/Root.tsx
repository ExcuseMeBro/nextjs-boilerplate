import { Composition } from "remotion";
import { IntroComposition } from "./IntroComposition";

export function RemotionRoot() {
  return (
    <Composition
      component={IntroComposition}
      defaultProps={{}}
      durationInFrames={150}
      fps={30}
      height={1080}
      id="boilerplate-intro"
      width={1920}
    />
  );
}
