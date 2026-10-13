import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Lightbulb,
  Languages,
  Zap,
  TrendingUp,
} from "lucide-react";
import { subjects } from "@/lib/content";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="pill">
              <span aria-hidden="true">✦</span> A different way to learn
            </span>
          </div>
          <h1>
            Go beyond answers.
            <br />
            <em>Build understanding.</em>
          </h1>
          <p>
            Your learning journey, at your pace. Explore ideas, uncover
            misconceptions, and turn the tricky parts into moments of clarity.
          </p>
          <div className="actions">
            <Button asChild>
              <Link href="/learn">
                Start learning <ArrowRight size={17} />
              </Link>
            </Button>
            <Button asChild className="secondary">
              <Link href="/labs">Explore the labs</Link>
            </Button>
          </div>
          <div className="fine muted">
            No account needed · English, తెలుగు, हिन्दी
          </div>
        </div>
        <div className="hero-preview">
          <div className="preview-card">
            <div className="preview-top">
              <span>YOUR LEARNING WORKSPACE</span>
              <span className="pill">Curated demo</span>
            </div>
            <div className="preview-question">
              Why can’t a transformer use steady DC?
            </div>
            <div className="tutor-head">
              <div className="tutor-avatar">
                <Lightbulb size={20} />
              </div>
              <strong>Let’s find the missing piece.</strong>
            </div>
            <p className="preview-answer">
              A transformer needs a <strong>changing magnetic field</strong>. AC
              keeps that field changing; steady DC doesn’t.
            </p>
            <svg
              className="lab-svg"
              style={{ height: 125 }}
              viewBox="0 0 340 120"
              role="img"
              aria-label="Two coils share a magnetic core"
            >
              <rect
                x="100"
                y="20"
                width="140"
                height="80"
                rx="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="13"
              />
              {[35, 47, 59, 71, 83].map((y) => (
                <g key={y}>
                  <path
                    d={`M 85 ${y} Q 115 ${y - 7} 115 ${y + 5}`}
                    fill="none"
                    stroke="#b77644"
                    strokeWidth="5"
                  />
                  <path
                    d={`M 225 ${y} Q 255 ${y - 7} 255 ${y + 5}`}
                    fill="none"
                    stroke="#809854"
                    strokeWidth="5"
                  />
                </g>
              ))}
              <text x="30" y="70" fill="currentColor" fontSize="13">
                AC →
              </text>
              <text x="265" y="70" fill="currentColor" fontSize="13">
                → AC
              </text>
            </svg>
            <div className="mini-flow">
              <span>01 Assess</span>
              <span>02 Understand</span>
              <span>03 Practice</span>
              <span>04 Reflect</span>
            </div>
          </div>
          <div className="floating-note">
            <Check size={14} style={{ display: "inline", marginRight: 6 }} />A
            clearer explanation is one click away.
          </div>
        </div>
      </section>
      <section>
        <div className="section-head">
          <div>
            <div className="eyebrow">Follow your curiosity</div>
            <h2>A small topic. A big discovery.</h2>
            <p>Three interactive learning paths to get you started.</p>
          </div>
          <Link className="card-link" href="/learn">
            Explore subjects <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid3">
          {subjects.map((s, i) => {
            const Icon = [Zap, Code2, TrendingUp][i];
            return (
              <Link
                href={`/classroom?topic=${encodeURIComponent(s.name)}`}
                className={`card subject-card ${s.color}`}
                key={s.id}
              >
                <div className="subject-icon">
                  <Icon size={24} />
                </div>
                <small>{s.category}</small>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <span className="card-link">
                  Begin this path <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section>
        <div className="section-head">
          <div>
            <div className="eyebrow">Designed for the way you think</div>
            <h2>Learning is a cycle, not a chat.</h2>
          </div>
        </div>
        <div className="steps-grid">
          {[
            [
              "01",
              "Find your starting point",
              "A short diagnostic surfaces what needs attention.",
            ],
            [
              "02",
              "Make the idea click",
              "Switch explanations, examples, and languages.",
            ],
            [
              "03",
              "Put it into practice",
              "Try a lab and answer a different concept check.",
            ],
            [
              "04",
              "Reflect and revisit",
              "Use recorded results to choose what to review.",
            ],
          ].map(([n, title, text]) => (
            <div key={n}>
              <small>{n} /</small>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section-head">
        <div>
          <Languages size={24} />
          <h2>Understanding, in your language.</h2>
          <p>
            English, Telugu, and Hindi explanations with technical terms kept
            clear.
          </p>
        </div>
        <div>
          <BookOpen size={24} />
          <p>Built for curiosity. No claims of guaranteed mastery.</p>
        </div>
      </section>
    </>
  );
}
