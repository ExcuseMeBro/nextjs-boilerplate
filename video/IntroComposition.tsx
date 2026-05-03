import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const stack = ["Next.js", "REST", "JWT", "i18n", "Biome", "Remotion"];

export function IntroComposition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 18 } });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(progress, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #09090b 0%, #18181b 45%, #4c1d95 100%)",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 72,
      }}
    >
      <Img
        src={staticFile("next.svg")}
        style={{ filter: "invert(1)", height: 48, opacity: 0.9, width: 96 }}
      />
      <div style={{ flex: 1 }} />
      <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
        <p style={{ color: "#c4b5fd", fontSize: 32, fontWeight: 700, margin: 0 }}>
          Production starter
        </p>
        <h1 style={{ fontSize: 92, letterSpacing: -4, lineHeight: 0.95, margin: "20px 0" }}>
          Build secure apps faster.
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36 }}>
          {stack.map((item, index) => (
            <span
              key={item}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                fontSize: 28,
                opacity: interpolate(frame, [20 + index * 5, 40 + index * 5], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                padding: "12px 22px",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}
