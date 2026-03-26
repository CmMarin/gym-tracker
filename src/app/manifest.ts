import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuffBuddies",
    short_name: "BuffBuddies",
    description: "Level up your workouts and track progress like an RPG",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/site-icon.ico",
        sizes: "any",
        type: "image/x-icon"
      }
    ]
  };
}
