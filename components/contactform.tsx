"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormValues } from "@/lib/validators/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RotatingMicroStatement from "./ui/RotatingMicroStatement";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactFormValues) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    reset();
    alert("Message sent successfully");
  }

  return (
    <section
      id="contact-form"
      className="block space-y-20 md:space-y-0 md:grid grid-cols-2 gap-20 max-w-7xl mx-auto my-16 p-6"
    >
      <div className="space-y-4  md:mb-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          Have Something in Mind?
        </h1>
        <RotatingMicroStatement />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-md rounded-xl border p-6 border-neutral-900/10 bg-neutral-100/50 backdrop-blur-lg dark:border-neutral-100/10 dark:bg-neutral-900/50"
      >
        <div className="space-y-2">
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea rows={5} {...register("message")} />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </section>
  );
}
