"use client";
import { useState } from "react";
import katex from "katex";
import { Button } from "./ui/button";
export function quadratic(a: number, b: number, c: number, x: number) {
  return a * x * x + b * x + c;
}
export function Labs() {
  const [lab, setLab] = useState("transformers");
  const [turns, setTurns] = useState(200);
  const [ac, setAc] = useState(true);
  const [a, setA] = useState(1);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(6);
  const [step, setStep] = useState(0);
  const d = b * b - 4 * a * c;
  const points = Array.from({ length: 121 }, (_, i) => {
    const x = -6 + i / 10;
    return `${250 + x * 30},${150 - quadratic(a, b, c, x) * 8}`;
  }).join(" ");
  return (
    <>
      <div className="eyebrow">Learn by changing something</div>
      <h1 className="page-title">Ideas you can interact with.</h1>
      <p className="page-intro">
        Simplified educational models. Predict the result, change a parameter,
        and explain what happened.
      </p>
      <div className="toolbar" style={{ marginBottom: 24 }}>
        {[
          ["transformers", "Transformers"],
          ["python", "Python trace"],
          ["quadratics", "Quadratic graph"],
        ].map(([id, label]) => (
          <Button
            key={id}
            className={lab === id ? "" : "secondary"}
            aria-pressed={lab === id}
            onClick={() => setLab(id)}
          >
            {label}
          </Button>
        ))}
      </div>
      {lab === "transformers" && (
        <div className="card stack">
          <h2>Changing flux, changing voltage.</h2>
          <div className="form-grid">
            <div>
              <label htmlFor="turns">Secondary turns: {turns}</label>
              <input
                id="turns"
                type="range"
                min={50}
                max={400}
                step={50}
                value={turns}
                onChange={(e) => setTurns(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="supply">Supply type</label>
              <select
                id="supply"
                value={ac ? "ac" : "dc"}
                onChange={(e) => setAc(e.target.value === "ac")}
              >
                <option value="ac">10 V AC</option>
                <option value="dc">Steady DC (after switching)</option>
              </select>
            </div>
          </div>
          <svg
            className="lab-svg"
            viewBox="0 0 500 250"
            role="img"
            aria-label={`Transformer: 100 primary turns, ${turns} secondary turns. ${ac ? "Changing" : "Steady"} flux.`}
          >
            <rect
              x="145"
              y="55"
              width="210"
              height="140"
              rx="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="22"
            />
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={i}
                d={`M 123 ${78 + i * 17} Q 175 ${65 + i * 17} 175 ${85 + i * 17}`}
                fill="none"
                stroke="#b77644"
                strokeWidth="6"
              />
            ))}
            {Array.from({ length: Math.round(turns / 40) }, (_, i) => (
              <path
                key={i}
                d={`M 325 ${70 + i * 12} Q 380 ${57 + i * 12} 380 ${77 + i * 12}`}
                fill="none"
                stroke="#78994c"
                strokeWidth="5"
              />
            ))}
            <text x="25" y="125" fill="currentColor">
              {ac ? "10 V AC" : "DC"}
            </text>
            <text x="399" y="125" fill="currentColor">
              {ac ? `${(10 * turns) / 100} V` : "0 V*"}
            </text>
            <text x="190" y="130" fill="currentColor" fontSize="12">
              {ac ? "Changing flux →" : "Steady flux"}
            </text>
          </svg>
          <div className="notice" role="status">
            Ideal secondary output: {ac ? (10 * turns) / 100 : 0} V · Vs/Vp =
            Ns/Np. Primary turns: 100.{" "}
            {ac
              ? "AC continuously changes magnetic flux."
              : "*After the switching transient. Real DC may cause damaging current and overheating."}
          </div>
          <p>
            Use a conceptual model only. Never connect experimental windings to
            mains power. Losses, saturation, load, and switching transients are
            omitted.
          </p>
        </div>
      )}
      {lab === "python" && (
        <div className="card stack">
          <h2>Read. Predict. Trace.</h2>
          <p>
            This is a fixed program visualization. It does not execute learner
            code.
          </p>
          <pre>
            <code>
              {["for i in range(3):", "    if i == 1:", "        print(i)"].map(
                (line, i) => (
                  <span
                    key={line}
                    className={
                      i === (step === 0 ? 0 : step % 3)
                        ? "code-active"
                        : undefined
                    }
                  >
                    {line}
                    {"\n"}
                  </span>
                ),
              )}
            </code>
          </pre>
          <div className="notice" role="status">
            {
              [
                "Ready: range(3) will yield 0, 1, 2.",
                "i = 0; 0 == 1 is False. No output.",
                "i = 1; 1 == 1 is True.",
                "print(1) → output: 1",
                "i = 2; 2 == 1 is False. No new output.",
                "The range is exhausted. Final output: 1",
              ][step]
            }
          </div>
          <div className="actions">
            <Button disabled={step === 5} onClick={() => setStep(step + 1)}>
              Next step
            </Button>
            <Button className="secondary" onClick={() => setStep(0)}>
              Reset trace
            </Button>
          </div>
          <p>
            Common error: expecting 3 to be included in range(3). The end value
            is excluded.
          </p>
        </div>
      )}
      {lab === "quadratics" && (
        <div className="card stack">
          <h2>Meet the parabola.</h2>
          <div
            aria-label="Quadratic formula"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(
                "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}",
                { throwOnError: false, output: "htmlAndMathml" },
              ),
            }}
          />
          <div className="grid3">
            {(
              [
                ["a", a, setA],
                ["b", b, setB],
                ["c", c, setC],
              ] as const
            ).map(([name, value, set]) => (
              <div key={name}>
                <label htmlFor={`coef-${name}`}>
                  {name} = {value}
                </label>
                <input
                  id={`coef-${name}`}
                  type="range"
                  min={-6}
                  max={6}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                />
              </div>
            ))}
          </div>
          <svg
            className="lab-svg"
            viewBox="0 0 500 300"
            role="img"
            aria-label={`Graph of y = ${a}x squared + ${b}x + ${c}. Discriminant ${d}.`}
          >
            <defs>
              <clipPath id="plot">
                <rect width="500" height="300" />
              </clipPath>
            </defs>
            <path
              d="M 20 150 H 480 M 250 10 V 290"
              stroke="currentColor"
              opacity=".5"
            />
            <polyline
              clipPath="url(#plot)"
              points={points}
              fill="none"
              stroke="#a5824e"
              strokeWidth="3"
            />
            <text x="470" y="170" fill="currentColor">
              x
            </text>
            <text x="260" y="20" fill="currentColor">
              y
            </text>
          </svg>
          <div className="notice" role="status">
            {a === 0
              ? "a = 0: this is linear, so the quadratic formula does not apply."
              : d < 0
                ? `Discriminant = ${d}. No real roots.`
                : `Discriminant = ${d}. Roots: ${((-b + Math.sqrt(d)) / (2 * a)).toFixed(3)} and ${((-b - Math.sqrt(d)) / (2 * a)).toFixed(3)}.`}
          </div>
          <p>
            Graph window: x from −6 to 6; y from roughly −19 to 19. Portions
            outside the window are clipped.
          </p>
        </div>
      )}
    </>
  );
}
