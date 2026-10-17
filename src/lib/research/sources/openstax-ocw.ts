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
