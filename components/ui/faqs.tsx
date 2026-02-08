import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductFAQProps {
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
}
export function ProductFAQ({ faqs }: ProductFAQProps) {
  if (!faqs || faqs.length === 0) {
    return <p className="text-sm text-muted-foreground">No FAQs available.</p>;
  }

  return (
    <Accordion type="single" collapsible className="max-w-lg">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
