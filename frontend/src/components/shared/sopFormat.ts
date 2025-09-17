// -------- Types & Keys --------
export const SECTION_ORDER = [
  "hook",
  "segue",
  "academic",
  "extracurricular",
  "publications",
  "problems",
  "whySchool",
  "goal",
] as const;

export type SectionKey = (typeof SECTION_ORDER)[number];

export type SopSection = {
  title: string;
  content: string;
};

export type SopSections = Partial<Record<SectionKey, SopSection>>;

// -------- UI Labels / Defaults --------
export const SECTION_DEFS: Record<
  SectionKey,
  { title: string; hint?: string }
> = {
  hook: { title: "Hook" },
  segue: { title: "Segue (Journey / Motivation)" },
  academic: { title: "Academic Achievements" },
  extracurricular: { title: "Extracurricular Activities" },
  publications: { title: "Publications" },
  problems: { title: "Problems in Background" },
  whySchool: { title: "Why This School?" },
  goal: { title: "Your Goal / Conclusion" },
};

export const SECTION_DEFAULTS: Record<SectionKey, string> = {
  hook: "In a world increasingly driven by data and AI, my curiosity has always been how technology can truly augment human decisions. That curiosity pushed me toward ML and NLP.",
  segue:
    "This passion led me to pursue rigorous training in computer science, exploring both theory and real-world applications of intelligent systems.",
  academic:
    "• GPA 3.8; Dean’s List ×6\n• 2 peer-reviewed publications\n• Led a 5-member team; 94% NLP accuracy (↑12%)\n• Outstanding CS Student Award (Senior year)",
  extracurricular:
    "200+ hours teaching programming to underrepresented youth; President of AI Ethics Society; organized symposiums with 300+ attendees.",
  publications:
    'Doe, J. & Smith, A. (2023). "Advancing NLU via Contextual Embeddings" – ICML.\nSmith, A., Doe, J. (2023). "Ethics of LLM Deployment" – Journal of AI Ethics.',
  problems:
    "During an internship, our early bias-detection approach kept failing. Studying fairness metrics and collaborating with social scientists led to the breakthrough used in my thesis.",
  whySchool:
    "Stanford’s HAI and the Stanford NLP Group match my focus on interpretable ML. I’m especially keen to work with Prof. Chen on neural interpretability.",
  goal: "Short-term: contribute to explainable-AI research and co-author papers.\nLong-term: lead a lab building transparent, fair AI adopted by industry.\nConclusion: this program is the right environment to realize these goals.",
};

// -------- Pure Helpers --------
export function toStructuredSections(sections: SopSections): SopSection[] {
  return SECTION_ORDER.map((k) => ({
    title: sections[k]?.title ?? SECTION_DEFS[k].title,
    content: (sections[k]?.content ?? "").trim(),
  }));
}

export function escapeHtml(s: string = ""): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function assemblePlainText(sections: SopSections): string {
  return SECTION_ORDER.map((k) => {
    const sec = sections[k];
    const title = sec?.title ?? SECTION_DEFS[k].title;
    const content = sec?.content ?? "";
    return `${title}\n${content}`;
  }).join("\n\n");
}

// دو اینتر = پاراگراف؛ تک اینتر = <br>
export function nl2p(text = ""): string {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function buildBlocks(structured: SopSection[]): string {
  return structured
    .map(
      (sec) => `
    <section class="sop-sec">
      <h2 class="sop-h2">${escapeHtml(sec.title || "Untitled")}</h2>
      <div class="sop-body">${nl2p(sec.content || "")}</div>
    </section>`
    )
    .join("\n");
}

/**
 * ساخت HTML کامل (سازگار با لایت/دارک‌مد)
 * theme: "light" | "dark" — از بیرون پاس بده تا با تم برنامه همگام باشد
 */
export function assembleHtml(
  input: SopSection[] | SopSections,
  theme: "light" | "dark" = "light"
): string {
  const structured = Array.isArray(input) ? input : toStructuredSections(input);
  const blocks = buildBlocks(structured);
  const isDark = theme === "dark";

  const css = `
    :root {
      --ink:${isDark ? "#e5e7eb" : "#111827"};
      --bg:${isDark ? "#0b1020" : "#ffffff"};
      --muted:${isDark ? "#9ca3af" : "#6b7280"};
      --line:${isDark ? "#374151" : "#e5e7eb"};
      --h2-size:18px;
      --body-size:15.6px;
      --wrap:780px;
    }
    html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);}
    body{
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
                   "Noto Sans", "Vazirmatn", "IRANSans", Arial, "Apple Color Emoji",
                   "Segoe UI Emoji", "Segoe UI Symbol";
      line-height:1.75; margin:24px;
      -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
    }
    .wrap{ max-width:var(--wrap); margin:0 auto; }

    .sop-sec { padding:18px 0; }
    .sop-sec + .sop-sec { border-top:1px solid var(--line); }
    .sop-h2{ margin:0 0 10px; font-size:var(--h2-size); font-weight:800; letter-spacing:.2px; }
    .sop-body{ font-size:var(--body-size); text-align:justify; }
    .sop-body p { margin:0 0 10px; }
    .sop-body p:last-child { margin-bottom:0; }

    @media print {
      :root{ --bg:#ffffff; --ink:#111827; --muted:#6b7280; --line:#e5e7eb; }
      body { margin:0; }
      .wrap { max-width: unset; margin: 0 24px; }
      .sop-sec { page-break-inside: avoid; }
    }
  `;

  return `<!doctype html>
  <html lang="fa" dir="auto">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>SOP Preview</title>
      <style>${css}</style>
    </head>
    <body>
      <div class="wrap">${blocks}</div>
    </body>
  </html>`;
}
