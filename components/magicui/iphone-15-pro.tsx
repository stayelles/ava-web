"use client";

import { cn } from "@/lib/utils";

export interface Iphone15ProProps {
  width?: number;
  src?: string;
  videoSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Iphone15Pro({
  width = 220,
  src,
  videoSrc,
  children,
  className,
}: Iphone15ProProps) {
  const height = Math.round(width * (882 / 433));
  const scale = width / 433;

  // Screen area relative to the SVG viewBox (433 × 882)
  const screenLeft = `${(21.25 / 433) * 100}%`;
  const screenTop = `${(19.25 / 882) * 100}%`;
  const screenWidth = `${(389.5 / 433) * 100}%`;
  const screenHeight = `${(843.5 / 882) * 100}%`;
  const screenRadius = Math.round(55.75 * scale);

  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width, height, flexShrink: 0 }}
    >
      {/* ── Screen content (rendered behind the SVG frame) ── */}
      <div
        style={{
          position: "absolute",
          left: screenLeft,
          top: screenTop,
          width: screenWidth,
          height: screenHeight,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#0f172a",
          zIndex: 1,
        }}
      >
        {children}
        {!children && src && (
          <img
            src={src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {!children && videoSrc && (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      {/* ── SVG device frame (on top, pointer-events-none) ── */}
      {/* Screen fill path is intentionally omitted so content shows through */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 433 882"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
      >
        {/* Outer body */}
        <path
          d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z"
          fill="#3a3a3a"
        />
        {/* Side buttons */}
        <path
          d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z"
          fill="#3a3a3a"
        />
        <path
          d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z"
          fill="#3a3a3a"
        />
        <path
          d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z"
          fill="#3a3a3a"
        />
        <path
          d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z"
          fill="#3a3a3a"
        />
        {/* Inner bezel border */}
        <path
          d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z"
          fill="#1c1c1e"
        />
        {/* Top pill */}
        <path
          opacity="0.5"
          d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
          fill="#3a3a3a"
        />
        {/* Dynamic Island */}
        <path
          d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
          fill="#111"
        />
        {/* Camera ring */}
        <path
          d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z"
          fill="#1a1a1a"
        />
        {/* Camera dot */}
        <path
          d="M254 48.5C254 45.4624 256.462 43 259.5 43C262.538 43 265 45.4624 265 48.5C265 51.5376 262.538 54 259.5 54C256.462 54 254 51.5376 254 48.5Z"
          fill="#2a2a2a"
        />
      </svg>
    </div>
  );
}
