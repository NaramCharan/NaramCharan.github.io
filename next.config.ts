import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML/CSS/JS export → `out/`, served by GitHub Pages.
  output: "export",
  // Pages serves each route as a folder (`/projects/` → `/projects/index.html`).
  trailingSlash: true,
  // No Next image server in a static export.
  images: { unoptimized: true },
};

export default nextConfig;
