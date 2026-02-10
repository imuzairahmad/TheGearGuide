import nodemailer from "nodemailer";

type SendMailProps = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: SendMailProps) {
  if (!to) {
    throw new Error("No recipient email provided");
  }

  if (
    !process.env.MAILTRAP_HOST ||
    !process.env.MAILTRAP_PORT ||
    !process.env.MAILTRAP_USER ||
    !process.env.MAILTRAP_PASS
  ) {
    throw new Error("Mailtrap environment variables missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    secure: false, // Mailtrap uses 2525 / 587
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Contact Form" <no-reply@yourapp.com>`,
    to: to.trim(), // 👈 important
    subject,
    html,
  });
}
