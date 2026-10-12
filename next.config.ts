import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi load the dev server by the Mac's LAN IP
  // (which changes between days). Without it Next blocks the dev assets and
  // the page never becomes interactive on the phone. Dev-only; no effect in production.
  allowedDevOrigins: ["192.168.*.*"],
  // The dev-only "N" badge has no free corner: bottom-left is the music
  // toggle, top-right the mobile menu, bottom-right the chat, and top-left
  // lands on the chat's title on phones. Hidden; dev errors still show.
  devIndicators: false,
};

export default nextConfig;
