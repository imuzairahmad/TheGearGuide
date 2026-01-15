"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormValues } from "@/lib/validators/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RotatingMicroStatement from "./ui/RotatingMicroStatement";
import React, { useEffect } from "react";

export default function ContactForm() {
  const [success, setSuccess] = React.useState(false);

  //
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<ContactFormValues> = async (values) => {
    try {
      const endpoint = "/api/contact";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      reset();
      setSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section
      id="contact-form"
      className="block space-y-20 md:space-y-0 md:grid grid-cols-2 gap-20 max-w-7xl mx-auto my-16 p-6"
    >
      <div className="space-y-4 md:mb-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          Have Something in Mind?
        </h1>
        <RotatingMicroStatement />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-md rounded-xl border p-6 border-neutral-900/10 backdrop-blur-lg dark:border-neutral-100/10 "
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

        <Button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full text-white"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
        {success && (
          <p className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            ✅ Message sent successfully. I’ll get back to you soon.
          </p>
        )}
      </form>
    </section>
  );
}
