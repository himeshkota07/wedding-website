import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default bottom-left collides with the background-music toggle, and
  // top-right now collides with the mobile hamburger menu button. bottom-right
  // is free until the chatbot launcher lands there -- revisit this then.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
