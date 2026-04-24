"use client";

import { useData } from "../context/DataContext";
import Image from "next/image";

interface LetterheadProps {
  title: string;
  subtitle?: string;
  showBanner?: boolean;
  periode?: string;
}

export default function Letterhead({ title, subtitle, showBanner = true, periode }: LetterheadProps) {
  const { logoBase64 } = useData();

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Banner / Letterhead Header */}
      {showBanner && (
        <div style={{
          width: "100%",
          height: 120,
          position: "relative",
          marginBottom: 16,
          borderRadius: 8,
          overflow: "hidden",
          background: "linear-gradient(135deg, #1B4D3E 0%, #2D7A5F 100%)",
          border: "2px solid #D4AF37"
        }}>
          {/* Banner pattern - decorative lines */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)"
          }} />

          {/* Logo - either uploaded image or fallback emoji */}
          <div style={{
            position: "absolute",
            left: 24,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 16
          }}>
            {logoBase64 ? (
              <Image
                src={logoBase64}
                alt="Logo KSP Mulia"
                width={70}
                height={70}
                style={{
                  borderRadius: "50%",
                  border: "2px solid #D4AF37",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  objectFit: "cover"
                }}
                unoptimized // Since it's base64
              />
            ) : (
              <div style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "2px solid #D4AF37"
              }}>
                🏛️
              </div>
            )}
            <div style={{ color: "white" }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 0.5,
                lineHeight: 1.2
              }}>
                Koperasi Simpan Pinjam Mulia Dana Sejahtera
              </div>
              <div style={{
                fontSize: 12,
                opacity: 0.9,
                letterSpacing: 1,
                marginTop: 4
              }}>
                Melayani Dengan Ceria dan Kasih
              </div>
            </div>
          </div>

          {/* Right side: Official info */}
          <div style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
            textAlign: "right",
            color: "white",
            fontSize: 10,
            lineHeight: 1.6
          }}>
            <div>Akta: 03 / 09 November 2023</div>
            <div>Pengesahan: AHU-0005532.AH.01.39 (2025)</div>
            <div>NIB: 1111230014031 / 11 Nov 2023</div>
            <div>NPWP: 99.043.935.8-128.000</div>
          </div>
        </div>
      )}

      {/* Title Section */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#1B4D3E",
          margin: 0,
          letterSpacing: 0.5
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{
            fontSize: 14,
            color: "#6b7280",
            margin: "4px 0 0",
            fontWeight: 500
          }}>
            {subtitle}
          </p>
        )}
        {periode && (
          <p style={{
            fontSize: 13,
            color: "#6b7280",
            margin: "8px 0 0"
          }}>
            {periode}
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={{
        height: 3,
        background: "linear-gradient(90deg, #1B4D3E, #D4AF37, #1B4D3E)",
        borderRadius: 2,
        marginBottom: 24
      }} />
    </div>
  );
}
