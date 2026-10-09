import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lubarsch Credit",
    short_name: "Lubarsch",
    description: "Daily and weekly loans for market traders in Ibadan.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#0f5c3a",
    lang: "en-NG",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Apply", url: "/apply" },
      { name: "Calculator", url: "/calculator" },
      { name: "Check my application", url: "/check-status" },
    ],
  };
}
