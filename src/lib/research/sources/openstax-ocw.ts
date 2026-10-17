import type {
  ResearchSource,
  NormalizedSource,
  EducationalLevel,
  ResearchLanguage,
} from "../types";
import { extractMeaningfulTerms } from "../security";

interface OpenCurriculumEntry {
  title: string;
  url: string;
  publisher: "OpenStax" | "MIT OpenCourseWare";
  subject: string;
  topics: string[];
  excerpt: string;
  license: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

const OPEN_CURRICULUM: OpenCurriculumEntry[] = [
  {
    title: "University Physics Volume 2: Electromagnetic Induction and AC Circuits",
    url: "https://openstax.org/books/university-physics-volume-2/pages/13-1-mutual-inductance",
    publisher: "OpenStax",
    subject: "Physics",
    topics: ["transformer", "transformers", "induction", "electromagnetic", "magnetic", "flux", "faraday", "voltage", "current"],
    excerpt: "A transformer is an electrical device that transfers electrical energy between two or more circuits through electromagnetic induction. A varying current in one coil produces a varying magnetic flux, which induces a varying electromotive force across a second coil wound around the same core. The turns ratio determines step-up or step-down voltage transformation.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Intermediate",
  },
  {
    title: "Introduction to Computer Science and Programming in Python",
    url: "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",
    publisher: "MIT OpenCourseWare",
    subject: "Computer Science",
    topics: ["python", "loops", "loop", "condition", "conditions", "control", "flow", "iteration", "while", "for", "branching"],
    excerpt: "In Python, while loops execute a block of statements repeatedly as long as a condition evaluates to True. For loops iterate over sequences like lists or ranges. Branching with if, elif, and else allows programs to choose alternative paths of execution based on boolean truth values.",
    license: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)",
    level: "Beginner",
  },
  {
    title: "College Algebra: Quadratic Equations and Parabolas",
    url: "https://openstax.org/books/college-algebra/pages/2-5-quadratic-equations",
    publisher: "OpenStax",
    subject: "Mathematics",
    topics: ["quadratic", "equations", "roots", "parabola", "discriminant", "vertex", "algebra", "polynomial"],
    excerpt: "A quadratic equation is a second-order polynomial equation in a single variable x with the form ax^2 + bx + c = 0, where a is non-zero. The quadratic formula x = (-b ± √(b^2 - 4ac)) / (2a) solves for roots. The discriminant b^2 - 4ac reveals whether roots are two distinct real numbers, one repeated real root, or two complex conjugate roots.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Beginner",
  },
  {
    title: "Biology 2e: Photosynthesis and the Light-Dependent Reactions",
    url: "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
    publisher: "OpenStax",
    subject: "Biology",
    topics: ["photosynthesis", "chloroplast", "chlorophyll", "calvin", "light", "glucose", "carbon", "dioxide", "plant", "autotroph"],
    excerpt: "Photosynthesis transforms solar energy into chemical energy stored in carbohydrate molecules like glucose. In oxygenic photosynthesis, light energy excites electrons in chlorophyll within thylakoid membranes, generating ATP and NADPH, which then drive carbon fixation in the Calvin cycle.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Beginner",
  },
  {
    title: "Introduction to Climate Science: The Greenhouse Effect and Energy Balance",
    url: "https://ocw.mit.edu/courses/12-003-atmosphere-ocean-and-climate-dynamics-fall-2008/",
    publisher: "MIT OpenCourseWare",
    subject: "Earth Science",
    topics: ["climate", "change", "greenhouse", "carbon", "warming", "energy", "balance", "atmosphere", "temperature", "emissions"],
    excerpt: "Earth's global temperature is determined by the balance between absorbed solar shortwave radiation and outgoing terrestrial longwave infrared radiation. Greenhouse gases like carbon dioxide and methane absorb infrared radiation emitted by Earth's surface and re-radiate energy back downwards, warming the lower atmosphere.",
    license: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)",
    level: "Intermediate",
  },
  {
    title: "University Physics Volume 2: Direct-Current Circuits and Ohm's Law",
    url: "https://openstax.org/books/university-physics-volume-2/pages/9-2-resistivity-and-resistance",
    publisher: "OpenStax",
    subject: "Physics",
    topics: ["ohm", "ohms", "law", "resistance", "voltage", "current", "circuit", "circuits", "resistor", "amperes", "volts"],
    excerpt: "Ohm's law states that the current I through a conductor between two points is directly proportional to the voltage V across the two points and inversely proportional to the resistance R of the conductor, expressed as V = I * R.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Beginner",
  },
  {
    title: "University Physics Volume 1: Newton's Laws of Motion",
    url: "https://openstax.org/books/university-physics-volume-1/pages/5-intro-newtons-laws-of-motion",
    publisher: "OpenStax",
    subject: "Physics",
    topics: ["newton", "newtons", "laws", "motion", "inertia", "force", "acceleration", "mass", "friction", "gravity"],
    excerpt: "Newton's laws of motion describe the relationship between the motion of an object and the forces acting upon it: the first law establishes inertia, the second relates net force to mass and acceleration (F = m*a), and the third states that every action force has an equal and opposite reaction force.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Beginner",
  },
  {
    title: "Introductory Statistics: Probability Distributions and Normal Curve",
    url: "https://openstax.org/books/introductory-statistics/pages/6-practice",
    publisher: "OpenStax",
    subject: "Statistics",
    topics: ["statistics", "probability", "distribution", "distributions", "normal", "mean", "median", "variance", "standard", "deviation"],
    excerpt: "A continuous probability distribution models probabilities of random variables. The normal distribution is a bell-shaped, symmetric distribution characterized by its mean (center) and standard deviation (spread), with approximately 68% of data within one standard deviation and 95% within two standard deviations.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Beginner",
  },
  {
    title: "World History: The Industrial Revolution and Global Transformation",
    url: "https://openstax.org/books/world-history-volume-2/pages/6-1-the-industrial-revolution-begins-in-great-britain",
    publisher: "OpenStax",
    subject: "History",
    topics: ["industrial", "revolution", "steam", "manufacturing", "textile", "britain", "urbanization", "factories", "coal", "economy"],
    excerpt: "The Industrial Revolution began in Great Britain in the late 18th century, transitioning agrarian societies into industrial and urban economies driven by steam power, mechanized textile manufacturing, iron production, and the factory system.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Intermediate",
  },
  {
    title: "Principles of Finance: Time Value of Money and Compound Interest",
    url: "https://openstax.org/books/principles-finance/pages/7-1-the-time-value-of-money",
    publisher: "OpenStax",
    subject: "Economics & Finance",
    topics: ["compound", "interest", "inflation", "money", "finance", "principal", "rate", "exponential", "savings", "investment"],
    excerpt: "Compound interest is interest calculated on both the initial principal and the accumulated interest from prior periods. Due to exponential compounding, investments grow significantly faster over time than under simple interest, while inflation continuously erodes future purchasing power.",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    level: "Beginner",
  },
];

export class OpenStaxOCWSource implements ResearchSource {
  readonly name = "openstax_ocw";

  async search(
    topic: string,
    educationalLevel: EducationalLevel,
    _language: ResearchLanguage,
    limit = 2,
  ): Promise<NormalizedSource[]> {
    const queryTerms = extractMeaningfulTerms(topic);
    if (queryTerms.length === 0) return [];

    const scored = OPEN_CURRICULUM.map((item) => {
      let matches = 0;
      for (const term of queryTerms) {
        if (
          item.topics.some((t) => t.includes(term) || term.includes(t)) ||
          item.title.toLowerCase().includes(term) ||
          item.excerpt.toLowerCase().includes(term)
        ) {
          matches++;
        }
      }
      return { item, matches };
    }).filter(({ matches }) => matches > 0);

    scored.sort((a, b) => b.matches - a.matches);

    return scored.slice(0, limit).map(({ item, matches }, idx) => ({
      sourceId: `openstax_ocw_${idx + 1}`,
      title: item.title,
      url: item.url,
      publisher: item.publisher,
      retrievedDate: new Date().toISOString().split("T")[0],
      excerpt: item.excerpt,
      contentType: "textbook",
      license: item.license,
      retrievalMethod: "curated",
      confidenceSignals: {
        relevanceScore: Math.min(1, Math.round((matches / queryTerms.length) * 100) / 100),
        termMatchCount: matches,
        authorityWeight: 0.95,
      },
    }));
  }
}
