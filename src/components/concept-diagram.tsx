import { topicKey } from "@/lib/content";
export function ConceptDiagram({ topic }: { topic: string }) {
  const key = topicKey(topic);
  const labels =
    key === "transformers"
      ? ["Alternating current", "Changing core flux", "Induced voltage"]
      : key === "python"
        ? ["Next range value", "Check condition", "Run matching body"]
        : key === "quadratics"
          ? [
              "Coefficients a, b, c",
              "Parabola y = ax² + bx + c",
              "Roots where y = 0",
            ]
          : ["Learning objective", "Worked example", "Concept check"];
  return (
    <figure>
      <svg
        className="lab-svg"
        style={{ height: 180 }}
        viewBox="0 0 600 150"
        role="img"
        aria-label={labels.join(" leads to ")}
      >
        {labels.map((label, i) => (
          <g key={label}>
            <rect
              x={10 + i * 200}
              y="40"
              width="180"
              height="70"
              rx="12"
              fill="none"
              stroke="currentColor"
            />
            <text
              x={100 + i * 200}
              y="80"
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {label}
            </text>
            {i < 2 && (
              <path
                d={`M ${191 + i * 200} 75 h 17 m -7 -6 7 6 -7 6`}
                stroke="currentColor"
                fill="none"
              />
            )}
          </g>
        ))}
      </svg>
      <figcaption className="fine muted">
        Conceptual relationships; open the lab to test the idea interactively.
      </figcaption>
    </figure>
  );
}
