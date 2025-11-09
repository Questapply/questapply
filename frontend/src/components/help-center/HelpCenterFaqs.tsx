// src/pages/help-center/Faqs.tsx

import { Link } from "react-router-dom";
import { faqCategoriesMeta } from "./faqData";

export default function HelpCenterFaqsIndex() {
  return (
    <div className="max-w-6xl mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Explore FAQs by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {faqCategoriesMeta.map((c) => (
          <Link
            key={c.id}
            to={`/help-center/faqs/${c.id}`}
            className="rounded-xl border p-4 bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700 hover:shadow transition text-center"
          >
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-sm text-gray-800 dark:text-gray-200">
              {c.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
