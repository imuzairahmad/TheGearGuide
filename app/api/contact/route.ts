import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { canSendToday } from "@/app/upstash/upstash";
import { contactSchema } from "@/lib/validators/contact";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, message } = contactSchema.parse(body);

    const allowed = await canSendToday(email);
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily limit reached (2 messages per day)" },
        { status: 429 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST!,
      port: Number(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_USER!,
        pass: process.env.MAILTRAP_PASS!,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.CONTACT_FROM_EMAIL}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New Contact Message — ${name}`,
      text: message,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
