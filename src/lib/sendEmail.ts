// lib/sendEmail.ts
import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  // Configure your transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // or 'SendGrid' or custom
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Actually send
  await transporter.sendMail({
    from: `"My App" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}
