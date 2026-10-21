import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://neurolearn-ai.vercel.app";
  const routes = [
    "",
    "/learn",
    "/classroom",
    "/assessment",
    "/labs",
    "/roadmap",
    "/progress",
    "/about",
    "/privacy",
    "/settings",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/learn" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/learn" || route === "/classroom" ? 0.9 : 0.7,
  }));
}
