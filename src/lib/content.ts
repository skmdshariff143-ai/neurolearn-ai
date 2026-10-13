import type { Question, TutorRequest, Lesson } from "./domain";
export const subjects = [
  {
    id: "transformers",
    name: "Electrical transformers",
    category: "Electrical engineering",
    description:
      "Follow the changing magnetic field. Understand why AC matters.",
    color: "orange",
  },
  {
    id: "python",
    name: "Python loops & conditions",
    category: "Programming",
    description: "Trace a program one step at a time. Predict before you run.",
    color: "green",
  },
  {
    id: "quadratics",
    name: "Quadratic equations",
    category: "Mathematics",
    description: "Connect the formula, the roots, and the shape of a parabola.",
    color: "purple",
  },
];
export function topicKey(topic: string) {
  return /transform|electr|ట్రాన్స్|ट्रांस/i.test(topic)
    ? "transformers"
    : /python|loop|పైథాన్|पायथन/i.test(topic)
      ? "python"
      : /quadratic|equation|ద్విఘాత|द्विघात/i.test(topic)
        ? "quadratics"
        : null;
}
const bank: Record<string, Question[][]> = {
  transformers: [
    [
      {
        id: "t1",
        concept: "changing-flux",
        prompt:
          "What does a conventional transformer need for continuous operation?",
        options: [
          "Steady DC",
          "Changing magnetic flux",
          "A permanent magnet alone",
        ],
        correct: 1,
        reason:
          "A changing magnetic flux induces voltage. Steady DC produces only a switching transient and can overheat a winding.",
      },
      {
        id: "t2",
        concept: "turns-ratio",
        prompt:
          "With 100 primary turns and 200 secondary turns, 10 V AC ideally becomes:",
        options: ["5 V", "10 V", "20 V"],
        correct: 2,
        reason: "Vs/Vp = Ns/Np = 2.",
      },
    ],
    [
      {
        id: "t3",
        concept: "changing-flux",
        prompt:
          "After a DC supply has settled, is secondary voltage continuously induced?",
        options: ["Yes", "No", "Only if secondary turns are doubled"],
        correct: 1,
        reason: "Settled DC does not continuously change flux.",
      },
      {
        id: "t4",
        concept: "turns-ratio",
        prompt:
          "A 240 V AC primary has 1000 turns. The secondary has 50 turns. Ideal output?",
        options: ["12 V", "120 V", "4800 V"],
        correct: 0,
        reason: "240 × 50/1000 = 12 V.",
      },
    ],
  ],
  python: [
    [
      {
        id: "p1",
        concept: "range-boundary",
        prompt: "How many iterations does range(3) produce?",
        options: ["2", "3", "4"],
        correct: 1,
        reason: "range(3) yields 0, 1, 2; the stop value is excluded.",
      },
      {
        id: "p2",
        concept: "condition",
        prompt: "Which expression tests whether x equals 5?",
        options: ["x = 5", "x == 5", "x != 5"],
        correct: 1,
        reason: "== compares; = assigns.",
      },
    ],
    [
      {
        id: "p3",
        concept: "range-boundary",
        prompt: "What is the last value in range(1, 4)?",
        options: ["2", "3", "4"],
        correct: 1,
        reason: "The stop value 4 is excluded.",
      },
      {
        id: "p4",
        concept: "condition",
        prompt: "For x = 2, what is x > 3?",
        options: ["True", "False", "Syntax error"],
        correct: 1,
        reason: "2 is not greater than 3.",
      },
    ],
  ],
  quadratics: [
    [
      {
        id: "q1",
        concept: "roots",
        prompt: "The roots of x² − 5x + 6 = 0 are:",
        options: ["2 and 3", "−2 and −3", "1 and 6"],
        correct: 0,
        reason: "(x − 2)(x − 3) = 0.",
      },
      {
        id: "q2",
        concept: "discriminant",
        prompt: "If b² − 4ac is negative, a real-coefficient quadratic has:",
        options: [
          "Two distinct real roots",
          "One repeated real root",
          "No real roots",
        ],
        correct: 2,
        reason: "A negative discriminant gives complex conjugate roots.",
      },
    ],
    [
      {
        id: "q3",
        concept: "roots",
        prompt: "Solve x² − 7x + 12 = 0.",
        options: ["3 and 4", "−3 and −4", "2 and 6"],
        correct: 0,
        reason: "(x − 3)(x − 4) = 0.",
      },
      {
        id: "q4",
        concept: "discriminant",
        prompt: "A discriminant of zero indicates:",
        options: [
          "A repeated real root",
          "No roots",
          "Two distinct real roots",
        ],
        correct: 0,
        reason: "The ± square-root term is zero, so the two roots coincide.",
      },
    ],
  ],
};
export function questions(topic: string, post = false) {
  const key = topicKey(topic);
  return key ? bank[key][post ? 1 : 0] : [];
}
const basics: Record<string, string> = {
  transformers:
    "A transformer transfers energy between coils through a changing magnetic field. Alternating current (AC) changes the flux in an iron core, inducing voltage in the secondary coil. Steady direct current (DC) does not continuously induce secondary voltage. For an ideal transformer, Vs/Vp = Ns/Np. With 100 primary turns, 200 secondary turns, and 10 V AC input, the output is 20 V AC. Real transformers have losses; never experiment with mains electricity.",
  python:
    "A loop repeats instructions. A condition chooses which instructions run. In Python, range(3) produces 0, 1, 2. For each value, the loop body runs once. The expression i == 1 checks equality; i = 1 assigns a value. Indentation determines the body. Predict the values first, then follow the highlighted steps in the lab.",
  quadratics:
    "A quadratic has the form ax² + bx + c = 0, with a ≠ 0. Its graph is a parabola. The roots are the x-coordinates where the graph crosses zero. For x² − 5x + 6 = 0, factor into (x − 2)(x − 3) = 0, giving x = 2 or x = 3. The discriminant b² − 4ac determines the number of real roots.",
};
const native: Record<string, Record<string, string>> = {
  Telugu: {
    transformers:
      "ట్రాన్స్‌ఫార్మర్‌లో AC వల్ల అయస్కాంత ప్రవాహం మారుతుంది. ఈ మార్పు రెండవ కాయిల్‌లో వోల్టేజ్‌ను ప్రేరేపిస్తుంది (electromagnetic induction). స్థిరమైన DC నిరంతరంగా వోల్టేజ్‌ను ప్రేరేపించదు. ఆదర్శ నిష్పత్తి: Vs/Vp = Ns/Np.",
    python:
      "లూప్ (loop) సూచనలను మళ్లీ మళ్లీ అమలు చేస్తుంది. షరతు (condition) ఏ సూచన అమలు కావాలో నిర్ణయిస్తుంది. range(3) విలువలు 0, 1, 2. చివరి విలువ 3 చేర్చబడదు. == సమానత్వాన్ని పరీక్షిస్తుంది.",
    quadratics:
      "ద్విఘాత సమీకరణం ax² + bx + c = 0 రూపంలో ఉంటుంది; a ≠ 0. x² − 5x + 6 = 0 ను (x − 2)(x − 3) = 0 గా రాయవచ్చు. కాబట్టి మూలాలు (roots) 2 మరియు 3.",
  },
  Hindi: {
    transformers:
      "ट्रांसफॉर्मर में AC से चुंबकीय फ्लक्स बदलता है। यह बदलाव दूसरी कुंडली में वोल्टेज प्रेरित करता है (electromagnetic induction)। स्थिर DC लगातार वोल्टेज प्रेरित नहीं करता। आदर्श अनुपात: Vs/Vp = Ns/Np.",
    python:
      "लूप (loop) निर्देशों को दोहराता है। शर्त (condition) तय करती है कि कौन से निर्देश चलेंगे। range(3) से 0, 1, 2 मिलते हैं; अंतिम सीमा 3 शामिल नहीं होती। == समानता जाँचता है।",
    quadratics:
      "द्विघात समीकरण ax² + bx + c = 0 है, जहाँ a ≠ 0। x² − 5x + 6 = 0 को (x − 2)(x − 3) = 0 लिख सकते हैं। इसलिए मूल (roots) 2 और 3 हैं।",
  },
};
const extras: Record<string, Record<string, string>> = {
  simple: {
    transformers:
      "Think of two coils sharing a changing magnetic field. Change is the key: no continuous change means no continuous induced voltage.",
    python:
      "Repeat with for. Choose with if. range stops before its end number.",
    quadratics:
      "Find the places where the curved graph touches or crosses the horizontal axis.",
  },
  example: {
    transformers:
      "A low-voltage AC adapter can step voltage down. A 20:1 turns ratio changes 240 V AC to about 12 V AC ideally.",
    python:
      "Checking each item in a shopping list uses repetition; choosing only discounted items uses a condition.",
    quadratics:
      "A simplified height model h(t) = −t² + 4t reaches the ground when t = 0 or t = 4.",
  },
  analogy: {
    transformers:
      "Two coils are like partners communicating through a changing magnetic signal. The analogy does not imply physical electrical contact.",
    python:
      "A loop is a repeated checklist. An if statement is a decision gate on the checklist.",
    quadratics:
      "A parabola resembles an arch; its intersections with ground level represent roots.",
  },
  steps: {
    transformers:
      "1. Apply AC to the primary.\n2. The core flux changes.\n3. The secondary experiences changing flux.\n4. An induced voltage appears.",
    python:
      "1. Take the next range value.\n2. Assign it to i.\n3. Evaluate the condition.\n4. Run the matching body.\n5. Repeat until the range ends.",
    quadratics:
      "1. Put the equation equal to zero.\n2. Identify a, b, c.\n3. Compute b² − 4ac.\n4. Substitute into the quadratic formula.\n5. Check each root.",
  },
  worked: {
    transformers:
      "Vp = 10 V; Np = 100; Ns = 200.\nVs = Vp × Ns/Np = 10 × 200/100 = 20 V.",
    python:
      "for i in range(3):\n    if i == 1:\n        print(i)\n\nTrace: i=0 → false; i=1 → true, prints 1; i=2 → false.",
    quadratics: "a=1, b=−5, c=6. D=25−24=1. x=(5 ± 1)/2, giving 3 and 2.",
  },
  application: {
    transformers:
      "Power distribution uses step-up transformers to reduce current for the same transmitted power, reducing resistive losses.",
    python:
      "Filter data: loop over entries and keep only those that meet a condition.",
    quadratics:
      "Quadratics model simplified trajectories and optimization problems; check the assumptions of the model.",
  },
};
export function fixture(r: TutorRequest): Lesson {
  const key = topicKey(r.topic);
  if (!key)
    return {
      title: "Live provider needed",
      explanation:
        "This deterministic demonstration supports transformers, Python loops, and quadratic equations. Configure a live provider to teach other topics; no answer has been generated for your topic.",
      check:
        "Choose a curated learning path to try the adaptive demonstration.",
      concepts: [],
    };
  const text = r.language === "English" ? basics[key] : native[r.language][key];
  const extra = extras[r.strategy]?.[key];
  return {
    title: `${r.topic} · ${r.strategy}`,
    explanation:
      r.strategy === "test"
        ? questions(r.topic, true)
            .map((q) => q.prompt)
            .join("\n")
        : r.strategy === "diagram"
          ? `${text}\nOpen the interactive lab to explore the diagram and change its parameters.`
          : extra
            ? `${text}\n\n${extra}`
            : text,
    check: questions(r.topic, true)[0].prompt,
    concepts: questions(r.topic).map((q) => q.concept),
  };
}
