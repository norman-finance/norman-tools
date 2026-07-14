"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/section-heading";

interface FaqSectionProps {
  items: Array<{ question: string; answer: string }>;
  heading?: string;
  id?: string;
}

export function FaqSection({ items, heading, id }: FaqSectionProps) {
  return (
    <section id={id} className="germany-faq-section">
      <div className="germany-faq-content">
        <SectionHeading title={heading ?? "FAQ"} />

        <Accordion type="single" collapsible className="germany-faq-list">
          {items.map((item, i) => (
            <AccordionItem key={item.question} value={`item-${i}`} className="germany-faq-item">
              <AccordionTrigger className="germany-faq-question">
                <span>{item.question}</span>
                <span className="germany-faq-icon" aria-hidden />
              </AccordionTrigger>
              <AccordionContent className="germany-faq-answer">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
