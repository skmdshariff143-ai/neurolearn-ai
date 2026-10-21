import type { Metadata } from "next";
import { safePreview } from "@/lib/preview";
import { Shell } from "@/components/shell";
import "./globals.css";
import "katex/dist/katex.min.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://neurolearn-ai.vercel.app"),
  robots: safePreview ? { index: false, follow: false } : { index: true, follow: true },
  title: {
    default: "NeuroLearn AI · Understand deeply",
    template: "%s · NeuroLearn AI",
  },
  description:
    "An adaptive learning workspace featuring diagnostic assessment, evidence-grounded research, interactive labs, concept checks, and multilingual teaching in English, Telugu, and Hindi.",
  openGraph: {
    title: "NeuroLearn AI · Adaptive Learning Workspace",
    description:
      "Go beyond answers. Build genuine understanding through adaptive explanations, interactive labs, and formative checks.",
    url: "https://neurolearn-ai.vercel.app",
    siteName: "NeuroLearn AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroLearn AI · Understand deeply",
    description:
      "Adaptive learning workspace with interactive labs, evidence-grounded research, and multilingual teaching.",
  },
  alternates: {
    canonical: "/",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
