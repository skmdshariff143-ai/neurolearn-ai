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
          ["ohms_law", "Ohm's Law"],
          ["python", "Python trace"],
          ["quadratics", "Quadratic graph"],
          ["photosynthesis", "Photosynthesis"],
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
      {lab === "ohms_law" && (
        <div className="card stack">
          <h2>Ohm&apos;s Law: Voltage, Current, and Resistance.</h2>
          <div
            aria-label="Ohm's law formula"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString("V = I \\times R \\implies I = \\frac{V}{R}", {
                throwOnError: false,
                output: "htmlAndMathml",
              }),
            }}
          />
          <div className="form-grid">
            <div>
              <label htmlFor="voltage">Voltage (V): {turns / 20} V</label>
              <input
                id="voltage"
                type="range"
                min={2}
                max={24}
                step={2}
                value={turns / 20}
                onChange={(e) => setTurns(Number(e.target.value) * 20)}
              />
            </div>
            <div>
              <label htmlFor="resistance">Resistance (R): {a * 5 + 35} Ω</label>
              <input
                id="resistance"
                type="range"
                min={10}
                max={100}
                step={5}
                value={a * 5 + 35}
                onChange={(e) => setA(Math.round((Number(e.target.value) - 35) / 5))}
              />
            </div>
          </div>
          {(() => {
            const v = turns / 20;
            const r = a * 5 + 35;
            const current = (v / r) * 1000; // in mA
            const power = (v * v) / r;
            return (
              <>
                <svg
                  className="lab-svg"
                  viewBox="0 0 500 240"
                  role="img"
                  aria-label={`Circuit: ${v} Volts across ${r} Ohms resulting in ${current.toFixed(1)} milliamperes.`}
                >
                  <rect x="80" y="40" width="340" height="160" fill="none" stroke="currentColor" strokeWidth="4" rx="8" />
                  <circle cx="80" cy="120" r="24" fill="var(--surface)" stroke="#b77644" strokeWidth="4" />
                  <text x="72" y="125" fill="currentColor" fontWeight="bold">V</text>
                  <rect x="220" y="30" width="60" height="20" fill="var(--surface)" stroke="#78994c" strokeWidth="4" />
                  <text x="235" y="45" fill="currentColor" fontSize="12" fontWeight="bold">R</text>
                  <circle cx="420" cy="120" r="20" fill="var(--surface)" stroke="currentColor" strokeWidth="3" />
                  <text x="414" y="125" fill="currentColor" fontWeight="bold">A</text>
                  <path d="M 170 30 L 190 40 L 170 50 Z" fill="#b77644" />
                  <text x="175" y="75" fill="currentColor" fontSize="13">I →</text>
                  <text x="210" y="140" fill="currentColor" fontSize="18" fontWeight="bold">
                    I = {current.toFixed(1)} mA
                  </text>
                  <text x="210" y="168" fill="currentColor" fontSize="13">
                    Power dissipation: {power.toFixed(2)} W
                  </text>
                </svg>
                <div className="notice" role="status">
                  <strong>Relationship:</strong> Doubling voltage doubles current (direct proportion). Doubling resistance halves current (inverse proportion).
                </div>
              </>
            );
          })()}
        </div>
      )}
      {lab === "photosynthesis" && (
        <div className="card stack">
          <h2>Photosynthesis & Energy Conversion.</h2>
          <div
            aria-label="Photosynthesis overall formula"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(
                "6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Light} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2",
                { throwOnError: false, output: "htmlAndMathml" },
              ),
            }}
          />
          <div className="form-grid">
            <div>
              <label htmlFor="light-intensity">Light intensity: {b + 7} / 13</label>
              <input
                id="light-intensity"
                type="range"
                min={-6}
                max={6}
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="co2-level">CO₂ concentration: {c + 7} / 13</label>
              <input
                id="co2-level"
                type="range"
                min={-6}
                max={6}
                value={c}
                onChange={(e) => setC(Number(e.target.value))}
              />
            </div>
          </div>
          {(() => {
            const light = b + 7;
            const co2 = c + 7;
            const rate = Math.min(light, co2) * 7.5;
            const limitingFactor = light < co2 ? "Light intensity" : light > co2 ? "CO₂ availability" : "Balanced";
            return (
              <>
                <svg
                  className="lab-svg"
                  viewBox="0 0 500 240"
                  role="img"
                  aria-label={`Photosynthesis rate: ${rate.toFixed(0)} percent. Limiting factor: ${limitingFactor}.`}
                >
                  <rect x="40" y="40" width="180" height="160" rx="12" fill="none" stroke="#507842" strokeWidth="4" />
                  <text x="50" y="70" fill="currentColor" fontWeight="bold">Light Reactions (Thylakoid)</text>
                  <text x="50" y="100" fill="currentColor" fontSize="12">H₂O → O₂ (Photolysis)</text>
                  <text x="50" y="125" fill="currentColor" fontSize="12">Generates ATP & NADPH</text>
                  <path d="M 225 110 L 275 110" stroke="currentColor" strokeWidth="3" markerEnd="url(#arrow)" />
                  <text x="232" y="100" fill="currentColor" fontSize="11">ATP / NADPH</text>
                  <rect x="280" y="40" width="180" height="160" rx="12" fill="none" stroke="#b77644" strokeWidth="4" />
                  <text x="290" y="70" fill="currentColor" fontWeight="bold">Calvin Cycle (Stroma)</text>
                  <text x="290" y="100" fill="currentColor" fontSize="12">CO₂ Fixation (Rubisco)</text>
                  <text x="290" y="125" fill="currentColor" fontSize="12">Produces Glucose (G3P)</text>
                  <rect x="150" y="210" width="200" height="14" fill="#dce4dc" rx="7" />
                  <rect x="150" y="210" width={rate * 2} height="14" fill="#678147" rx="7" />
                </svg>
                <div className="notice" role="status">
                  <strong>Photosynthetic Rate: {rate.toFixed(0)}%</strong> · Current Limiting Factor: <em>{limitingFactor}</em> (Liebig&apos;s Law of the Minimum).
                </div>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
}
