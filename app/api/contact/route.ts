import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const ContactInput = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  message: z.string().min(10).max(4000),
  hcaptchaToken: z.string().min(1),
});

async function verifyHcaptcha(token: string, secret: string): Promise<boolean> {
  const params = new URLSearchParams({ secret, response: token });
  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: NextRequest) {
  const resendKey = process.env.RESEND_API_KEY;
  const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO;

  if (!resendKey || !hcaptchaSecret || !from || !to) {
    return NextResponse.json(
      { error: "Contact form is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = ContactInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in all fields correctly." },
      { status: 400 },
    );
  }

  const { name, email, message, hcaptchaToken } = parsed.data;

  const captchaOk = await verifyHcaptcha(hcaptchaToken, hcaptchaSecret);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "Captcha verification failed. Please try again." },
      { status: 400 },
    );
  }

  const resend = new Resend(resendKey);
  const subject = `Hosted access — ${name}`;
  const html = `
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Message:</strong></p>
    <div style="white-space: pre-wrap; padding: 12px; border-left: 3px solid #14b8a6; background: #f8fafc;">${escapeHtml(message)}</div>
    <hr />
    <p style="color: #64748b; font-size: 12px;">Sent from the kamotion.io hosted-access form.</p>
  `;
  const text = `From: ${name} <${email}>\n\n${message}\n\n— Sent from the kamotion.io hosted-access form.`;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json(
      { error: "Couldn’t send right now — please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
