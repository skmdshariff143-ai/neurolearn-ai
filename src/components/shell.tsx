"use client";
import Link from "next/link";
import { safePreview } from "@/lib/preview";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BrainCircuit,
  BookOpen,
  FlaskConical,
  ChartNoAxesCombined,
  Map,
  Settings,
  Sun,
  Moon,
  ArrowUpRight,
} from "lucide-react";
const links = [
  ["/learn", "Learn", BookOpen],
  ["/labs", "Labs", FlaskConical],
  ["/roadmap", "Roadmap", Map],
  ["/progress", "Progress", ChartNoAxesCombined],
  ["/settings", "Settings", Settings],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  return (
    <div className={dark ? "theme dark" : "theme"}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <Link className="brand" href="/">
          <span className="brand-icon">
            <BrainCircuit size={24} />
          </span>
          NeuroLearn<span className="brand-ai">AI</span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button
          className="icon-button"
          aria-label={dark ? "Use light mode" : "Use dark mode"}
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <Link className="header-cta" href="/learn">
          Start learning <ArrowUpRight size={16} />
        </Link>
      </header>
      <main id="main">
        {safePreview && (
          <div className="notice" role="note">
            Limited-access fixture preview — no live AI inference. Uploads,
            research, tracing and hosted storage are disabled. Learning activity
            uses temporary memory and resets on reload. Do not enter personal
            information.
          </div>
        )}
        {children}
      </main>
      <footer>
        <p>
          <strong>NeuroLearn AI</strong>
          <br />
          Learn Anything. Understand Deeply. Grow Continuously.
        </p>
        <div>
          <Link href="/about">Our mission</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="https://github.com/skmdshariff143-ai/neurolearn-ai">
            Source code
          </a>
        </div>
        <small>
          Development preview · Live Nebius inference is not yet verified.
        </small>
      </footer>
    </div>
  );
}
