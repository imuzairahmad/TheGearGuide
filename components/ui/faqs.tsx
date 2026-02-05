import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ProductFAQ() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          Who is this product best suited for?
        </AccordionTrigger>
        <AccordionContent>
          This product is ideal for small home use and beginners who need a
          simple, easy-to-use solution.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>
          Is this product suitable for professional or heavy-duty use?
        </AccordionTrigger>
        <AccordionContent>
          No. It is not intended for professional environments or heavy-duty
          continuous usage.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>
          Can beginners use this product easily?
        </AccordionTrigger>
        <AccordionContent>
          Yes. The product does not require advanced skills and is easy to
          operate.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4">
        <AccordionTrigger>
          What are the limitations of this product?
        </AccordionTrigger>
        <AccordionContent>
          It may not be suitable for long working hours or high-performance
          tasks.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5">
        <AccordionTrigger>
          Is it reliable for everyday casual use?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It works well for light, occasional, and everyday home use.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
