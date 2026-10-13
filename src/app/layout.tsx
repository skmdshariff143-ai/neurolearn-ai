import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import "./globals.css";
import "katex/dist/katex.min.css";
export const metadata: Metadata = {
  title: "NeuroLearn AI · Understand deeply",
  description:
    "An adaptive learning workspace with interactive labs, concept checks, and multilingual teaching.",
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
