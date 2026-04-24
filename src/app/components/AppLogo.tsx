"use client";

import { useData } from "../context/DataContext";
import Image from "next/image";

interface AppLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function AppLogo({ width = 36, height = 36, className }: AppLogoProps) {
  const { logoBase64 } = useData();

  if (logoBase64) {
    return (
      <Image
        src={logoBase64}
        alt="KSP Mulia Dana Sejahtera"
        width={width}
        height={height}
        className={className}
        style={{
          borderRadius: "50%",
          border: "2px solid #D4AF37",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          objectFit: "cover",
        }}
        unoptimized
      />
    );
  }

  // Fallback to emoji
  return (
    <span
      className={className}
      style={{
        fontSize: height * 0.8,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      🏛️
    </span>
  );
}
