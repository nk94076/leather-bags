import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

// No SMTP provider is configured in this environment, so the OTP is returned
// in the response for demo purposes. Wire this to a real email/SMS provider
// (see admin Settings > SMTP) before going to production.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond the same way whether the account exists or not, to avoid
  // leaking which emails are registered.
  if (!user) return NextResponse.json({ ok: true });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.passwordResetOtp.create({
    data: {
      email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return NextResponse.json({ ok: true, demoOtp: code });
}
