import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "@/components/landing/section-header";

const faqs = [
  {
    q: "How does the audit work?",
    a: "You enter the AI tools, plans, seats, and monthly cost. Aethra cross-references benchmark pricing and usage heuristics to surface concrete savings.",
  },
  {
    q: "Do you connect to billing data?",
    a: "On the free tier, no. On Team and Enterprise, billing integrations are available as optional add-ons.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We are SOC 2 ready, encrypt data in transit and at rest, and keep stack data private to your workspace.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There is no long-term lock-in and the free audit remains free.",
  },
  {
    q: "Do you support custom AI tools?",
    a: "Yes. You can model custom tools by using monthly spend and seat inputs inside the audit flow.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader eyebrow="FAQ" title="Questions, answered" />
        <Accordion type="single" collapsible className="mt-10 w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`f-${index}`} className="border-border">
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
