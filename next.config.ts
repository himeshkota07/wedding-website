import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default bottom-left collides with the background-music toggle; bottom-right
  // is reserved for the future chatbot launcher, so push this to a free corner.
  devIndicators: {
    position: "top-right",
  },
};

export default nextConfig;
