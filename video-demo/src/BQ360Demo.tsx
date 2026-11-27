import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import timelineData from "./timeline.json";

const COLORS = {
  bg: "#FFFFFF",
  backdrop: "#F4F6F9",
  navy: "#10284B",
  navyDeep: "#0A1B34",
  green: "#268C44",
  yellow: "#F3C922",
  red: "#D9323B",
  sky: "#6AB4E2",
  text: "#1F2937",
  muted: "#4B5563",
};

interface BadgeItem {
  label: string;
  color: string;
}

interface SceneItem {
  id: string;
  type: "hero" | "demo" | "outro";
  kicker: string;
  title: string;
  subtitle?: string;
  accent: string;
  badges?: BadgeItem[];
  bullets?: string[];
  narration: string;
  audioFile: string;
  clipFile?: string;
  durationSec: number;
  startFrame: number;
  durationFrames: number;
}

const FONT_FAMILY =
  "'Inter', 'Open Sans', 'Segoe UI', system-ui, -apple-system, sans-serif";

function splitIntoCaptions(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length > 0 ? sentences : [text];
}

function getActiveCaption(
  text: string,
  localFrame: number,
  audioFrames: number
): string {
  const parts = splitIntoCaptions(text);
  const totalChars = parts.reduce((acc, s) => acc + s.length, 0) || 1;
  const progress = Math.min(0.999, Math.max(0, localFrame / Math.max(1, audioFrames)));
  let acc = 0;
  for (const part of parts) {
    acc += part.length / totalChars;
    if (progress <= acc) return part;
  }
  return parts[parts.length - 1];
}

const TopIdentityStripe: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 10,
      display: "flex",
      zIndex: 30,
    }}
  >
    <div style={{ flex: 1, backgroundColor: COLORS.green }} />
    <div style={{ flex: 1, backgroundColor: COLORS.yellow }} />
    <div style={{ flex: 1, backgroundColor: COLORS.red }} />
    <div style={{ flex: 1, backgroundColor: COLORS.sky }} />
  </div>
);

const HeroOrOutroSlide: React.FC<{ scene: SceneItem }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [scene.durationFrames - 18, scene.durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 16, stiffness: 120 } }),
    [0, 1],
    [40, 0]
  );

  const audioFrames = Math.round(scene.durationSec * fps);
  const caption = getActiveCaption(scene.narration, frame, audioFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        fontFamily: FONT_FAMILY,
        color: COLORS.bg,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <TopIdentityStripe />

      {/* Motivos geometricos QUIJAM (DESIGN.md) */}
      <svg
        viewBox="0 0 1920 1080"
        fill="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.22,
        }}
      >
        <circle cx="1720" cy="180" r="240" fill={COLORS.sky} />
        <circle cx="1560" cy="860" r="190" fill={COLORS.green} />
        <path
          d="M1380 1080 C1380 740 1620 560 1920 560"
          stroke={COLORS.yellow}
          strokeWidth="44"
          strokeLinecap="round"
        />
        <circle cx="1440" cy="240" r="56" fill={COLORS.red} />
        <circle cx="160" cy="920" r="120" fill={COLORS.sky} opacity="0.5" />
      </svg>

      {/* Contenido central */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: "90px 140px 140px 140px",
          maxWidth: 1480,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {/* Kicker */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            alignSelf: "flex-start",
            backgroundColor: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 999,
            padding: "10px 24px",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: scene.accent,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 2.2,
              color: COLORS.yellow,
            }}
          >
            {scene.kicker}
          </span>
        </div>

        {/* Titulo */}
        <h1
          style={{
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            margin: 0,
            marginBottom: 28,
            color: COLORS.bg,
          }}
        >
          {scene.title}
        </h1>

        {/* Subtitulo */}
        {scene.subtitle && (
          <p
            style={{
              fontSize: 34,
              fontWeight: 400,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.88)",
              margin: 0,
              marginBottom: 46,
              maxWidth: 1120,
            }}
          >
            {scene.subtitle}
          </p>
        )}

        {/* Badges */}
        {scene.badges && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {scene.badges.map((badge, idx) => {
              const s = spring({
                frame: frame - (12 + idx * 7),
                fps,
                config: { damping: 14, stiffness: 130 },
              });
              const darkText =
                badge.color === COLORS.yellow || badge.color === COLORS.sky;
              return (
                <div
                  key={badge.label}
                  style={{
                    transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`,
                    opacity: interpolate(s, [0, 1], [0, 1]),
                    backgroundColor: badge.color,
                    color: darkText ? COLORS.navy : COLORS.bg,
                    padding: "14px 28px",
                    borderRadius: 999,
                    fontSize: 24,
                    fontWeight: 800,
                    boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
                  }}
                >
                  {badge.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Barra de subtitulos discreta */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          bottom: 42,
          zIndex: 20,
          backgroundColor: "rgba(10, 27, 52, 0.85)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 18,
          padding: "18px 28px",
          fontSize: 24,
          lineHeight: 1.35,
          color: "#FFFFFF",
          textAlign: "center",
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};

const DemoSlide: React.FC<{ scene: SceneItem; demoIndex: number; totalDemos: number }> = ({
  scene,
  demoIndex,
  totalDemos,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [scene.durationFrames - 14, scene.durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 110 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [36, 0]);

  const audioFrames = Math.round(scene.durationSec * fps);
  const caption = getActiveCaption(scene.narration, frame, audioFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.backdrop,
        fontFamily: FONT_FAMILY,
        color: COLORS.text,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <TopIdentityStripe />

      {/* Franja lateral derecha identidad QUIJAM */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 0,
          bottom: 0,
          width: 24,
          backgroundColor: COLORS.navy,
          zIndex: 10,
        }}
      />

      {/* Layout 2 columnas: Telefono (izq) + Explicacion (der) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          padding: "54px 90px 44px 96px",
          gap: 72,
        }}
      >
        {/* Columna izquierda: Mockup de Smartphone */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${phoneY}px)`,
          }}
        >
          <div
            style={{
              width: 444,
              height: 940,
              borderRadius: 52,
              backgroundColor: COLORS.navyDeep,
              padding: 14,
              boxShadow:
                "0 28px 60px -12px rgba(16, 40, 75, 0.34), 0 0 0 2px rgba(16, 40, 75, 0.14)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: 416,
                height: 912,
                borderRadius: 38,
                overflow: "hidden",
                backgroundColor: COLORS.navy,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Barra de estado limpia encima de la app (sin tapar el header) */}
              <div
                style={{
                  height: 34,
                  width: "100%",
                  backgroundColor: COLORS.navy,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 24px",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <span>9:41</span>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 88,
                    height: 18,
                    borderRadius: 999,
                    backgroundColor: COLORS.navyDeep,
                  }}
                />
                <span style={{ opacity: 0.9, letterSpacing: 1 }}>5G · 100%</span>
              </div>

              {/* Pantalla real 416x878 exacta (1:1 con Playwright, sin bordes grises) */}
              <div
                style={{
                  width: 416,
                  height: 878,
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                {scene.clipFile && (
                  <OffthreadVideo
                    src={staticFile(scene.clipFile)}
                    muted
                    style={{
                      width: 416,
                      height: 878,
                      objectFit: "fill",
                      display: "block",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Contenido editorial */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: 920,
            paddingTop: 18,
            paddingBottom: 8,
          }}
        >
          <div>
            {/* Kicker + contador */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  backgroundColor: COLORS.navy,
                  color: COLORS.yellow,
                  fontWeight: 800,
                  fontSize: 18,
                  padding: "8px 16px",
                  borderRadius: 999,
                  letterSpacing: 1,
                }}
              >
                0{demoIndex + 1} / 0{totalDemos}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: 1.6,
                  color: COLORS.navy,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    backgroundColor: scene.accent,
                    display: "inline-block",
                  }}
                />
                {scene.kicker}
              </span>
            </div>

            {/* Titulo principal */}
            <h2
              style={{
                fontSize: 60,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: -1,
                color: COLORS.navy,
                margin: 0,
                marginBottom: 38,
              }}
            >
              {scene.title}
            </h2>

            {/* Tarjetas de puntos clave */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {(scene.bullets || []).map((bullet, idx) => {
                const s = spring({
                  frame: frame - (16 + idx * 14),
                  fps,
                  config: { damping: 16, stiffness: 120 },
                });
                const translateX = interpolate(s, [0, 1], [36, 0]);
                const opacity = interpolate(s, [0, 1], [0, 1]);
                return (
                  <div
                    key={bullet}
                    style={{
                      transform: `translateX(${translateX}px)`,
                      opacity,
                      backgroundColor: COLORS.bg,
                      borderRadius: 22,
                      padding: "24px 28px",
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      boxShadow:
                        "0 0 0 1px rgba(16,40,75,0.06), 0 8px 20px -6px rgba(16,40,75,0.10)",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 999,
                        backgroundColor: scene.accent,
                        color:
                          scene.accent === COLORS.yellow ||
                          scene.accent === COLORS.sky
                            ? COLORS.navy
                            : "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 27,
                        fontWeight: 600,
                        lineHeight: 1.35,
                        color: COLORS.text,
                      }}
                    >
                      {bullet}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtitulo sincronizado + marca de pie */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                backgroundColor: COLORS.navy,
                color: "#FFFFFF",
                borderRadius: 20,
                padding: "20px 28px",
                fontSize: 23,
                lineHeight: 1.4,
                fontWeight: 500,
                borderLeft: `8px solid ${scene.accent}`,
                boxShadow: "0 12px 28px -8px rgba(16, 40, 75, 0.28)",
              }}
            >
              {caption}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.muted,
                padding: "0 4px",
              }}
            >
              <span>QUIJAM · Barranquilla 2034</span>
              <span>BQ360 · Demo Oficial</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const BQ360Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const scenes = timelineData.scenes as SceneItem[];
  const demoScenes = scenes.filter((s) => s.type === "demo");
  const totalProgress = Math.min(1, frame / Math.max(1, timelineData.totalFrames));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {scenes.map((scene) => {
        const demoIdx = demoScenes.findIndex((d) => d.id === scene.id);
        return (
          <Sequence
            key={scene.id}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
          >
            <Audio src={staticFile(scene.audioFile)} />
            {scene.type === "demo" ? (
              <DemoSlide
                scene={scene}
                demoIndex={demoIdx}
                totalDemos={demoScenes.length}
              />
            ) : (
              <HeroOrOutroSlide scene={scene} />
            )}
          </Sequence>
        );
      })}

      {/* Barra de progreso global */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          backgroundColor: "rgba(16, 40, 75, 0.25)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            width: `${totalProgress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.yellow}, ${COLORS.sky})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
