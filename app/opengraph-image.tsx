import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vice Signal — Broadcast the City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(217,70,239,0.25), transparent 60%)",
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#e879f9",
            marginBottom: 20,
          }}
        >
          Signal Network
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: -6,
            textTransform: "uppercase",
            color: "white",
            lineHeight: 0.85,
            display: "flex",
          }}
        >
          Vice Signal
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Broadcast the City
        </div>
      </div>
    ),
    { ...size }
  );
}
