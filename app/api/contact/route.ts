import { NextResponse } from "next/server";
// import { rateLimit } from "@/lib/utils/rate-limit";
import { sendMail } from "@/lib/utils/sendmail";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    await sendMail({
      to: "admin@yourapp.com",
      subject: "New Contact Message",
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
