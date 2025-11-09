// src/pages/help-center/FaqCategoryPage.tsx

import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  faqCategoriesMeta,
  faqContentByCategory,
  type FaqSection,
} from "./faqData";

export default function FaqCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = faqContentByCategory[categoryId ?? ""];
  const meta = useMemo(
    () => faqCategoriesMeta.find((c) => c.id === category?.id),
    [category]
  );

  if (!category) return <Navigate to="/help-center/faqs" replace />;

  // آکاردئون والد: فقط یک بخش باز باشد (و بتوان آن را بست)
  const [openSection, setOpenSection] = useState<string | undefined>(undefined);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {meta?.name ?? category.name}
        </h1>
        <Link to="/help-center/faqs" className="text-sm text-indigo-600 ">
          Back to FAQs
        </Link>
      </div>

      <Accordion
        type="single"
        collapsible
        value={openSection}
        onValueChange={setOpenSection}
        className="w-full"
      >
        {category.sections.map((section: FaqSection) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-md mb-3 border"
          >
            <AccordionTrigger className="px-4 py-3 text-left text-[16px] font-bold no-underline hover:no-underline focus:no-underline">
              {section.title}
            </AccordionTrigger>

            <AccordionContent className="px-2 pb-4">
              {/* آکاردئون داخلی: سوال‌ها (single + collapsible) */}
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((it, idx) => (
                  <AccordionItem
                    key={`${section.id}-${idx}`}
                    value={`${idx}`}
                    className="rounded-md mb-2 border bg-white dark:bg-gray-900"
                  >
                    <AccordionTrigger className="px-4 py-3 text-left no-underline hover:no-underline focus:no-underline">
                      {it.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-[15px] leading-6 text-gray-700 dark:text-gray-200">
                      <ReactMarkdown
                        components={{
                          strong: (props) => (
                            <strong className="font bold" {...props} />
                          ),
                          p: (props) => <p className="mb-2" {...props} />,
                          ul: (props) => (
                            <ul className="list-disc ml-6 mb-2" {...props} />
                          ),
                          li: (props) => <li className="mb-1" {...props} />,
                        }}
                      >
                        {it.a}
                      </ReactMarkdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
