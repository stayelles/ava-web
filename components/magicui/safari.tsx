"use client";

import { cn } from "@/lib/utils";

export interface SafariProps {
  url?: string;
  imageSrc?: string;
  videoSrc?: string;
  width?: number;
  children?: React.ReactNode;
  className?: string;
}

export function Safari({
  url = "call-ava.com",
  imageSrc,
  videoSrc,
  width = 600,
  children,
  className,
}: SafariProps) {
  const height = Math.round(width * (753 / 1203));
  // Toolbar height ratio: 52/753
  const toolbarPct = `${(52 / 753) * 100}%`;

  return (
    <div
      className={cn("relative select-none overflow-hidden rounded-lg", className)}
      style={{ width, height }}
    >
      {/* ── Browser body content (behind SVG toolbar) ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: toolbarPct,
          width: "100%",
          bottom: 0,
          background: "#0f172a",
          zIndex: 1,
        }}
      >
        {children}
        {!children && imageSrc && (
          <img
            src={imageSrc}
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

      {/* ── SVG toolbar frame (on top, pointer-events-none) ── */}
      {/* Body fill paths are omitted so content shows through */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 1203 753"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
      >
        {/* Toolbar background */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 12C0 5.37258 5.37258 0 12 0H1190C1196.63 0 1202 5.37258 1202 12V52H0L0 12Z"
          fill="#2a2a2e"
        />
        {/* Toolbar inner (slightly lighter) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.06738 12C1.06738 5.92487 5.99225 1 12.0674 1H1189.93C1196.01 1 1200.93 5.92487 1200.93 12V51H1.06738V12Z"
          fill="#1e1e22"
        />
        {/* Traffic lights */}
        <circle cx="27" cy="25" r="6" fill="#ff5f57" />
        <circle cx="47" cy="25" r="6" fill="#febc2e" />
        <circle cx="67" cy="25" r="6" fill="#28c840" />
        {/* URL bar */}
        <path
          d="M286 17C286 13.6863 288.686 11 292 11H946C949.314 11 952 13.6863 952 17V35C952 38.3137 949.314 41 946 41H292C288.686 41 286 38.3137 286 35V17Z"
          fill="#2d2d35"
        />
        {/* Lock icon stub */}
        <g opacity="0.6">
          <path
            d="M567.272 22.97C567.272 21.491 568.211 20.6785 569.348 20.6785C570.478 20.6785 571.423 21.491 571.423 22.97V24.6394L567.272 24.6458V22.97ZM566.269 32.0852H572.426C573.277 32.0852 573.696 31.6663 573.696 30.7395V25.9851C573.696 25.1472 573.353 24.7219 572.642 24.6521V23.0842C572.642 20.6721 571.036 19.5105 569.348 19.5105C567.659 19.5105 566.053 20.6721 566.053 23.0842V24.6711C565.393 24.7727 565 25.1917 565 25.9851V30.7395C565 31.6663 565.418 32.0852 566.269 32.0852Z"
            fill="#6b6b7a"
          />
        </g>
        {/* URL text */}
        <text
          x="585"
          y="30"
          fill="#8888a0"
          fontSize="12"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {url}
        </text>
        {/* Toolbar bottom border */}
        <line x1="0" y1="52" x2="1203" y2="52" stroke="#333340" strokeWidth="1" />
      </svg>
    </div>
  );
}
