"use client";
import { usePathname } from "next/navigation";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages with their own full-width hero section shouldn't add extra padding
  const isLandingPage = pathname === "/";
  
  return (
    <div style={{
      padding: isLandingPage ? "48px 24px" : "32px 0"
    }}>
      {children}
    </div>
  );
}