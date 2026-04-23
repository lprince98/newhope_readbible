import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "새소망 성경 통독",
    short_name: "새소망통독",
    description: "공동체와 함께하는 성경 통독 여정",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#041129",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
