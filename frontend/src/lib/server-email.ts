import nodemailer from "nodemailer";

function smtpConfig() {
  return {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASSWORD ?? "",
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
    fromName: process.env.SMTP_FROM_NAME || "Swastik Makhana",
    useTls: process.env.SMTP_USE_TLS !== "false",
  };
}

export function isSmtpConfigured(): boolean {
  const c = smtpConfig();
  return Boolean(c.host && c.user && c.pass);
}

export async function sendLaunchNotifyConfirmation(
  toEmail: string,
  categoryName: string,
): Promise<void> {
  const c = smtpConfig();
  if (!isSmtpConfigured()) {
    throw new Error("SMTP not configured");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const plain = [
    "Namaste!",
    "",
    `You're on the list for ${categoryName}.`,
    "",
    "We'll email you as soon as this Swastik Makhana range goes live on our website.",
    "",
    `Meanwhile, shop thin plain makhana: ${siteUrl}/makhana`,
    "",
    "With warmth,",
    "Team Swastik Makhana",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;color:#1c1408">
      <h2 style="color:#2c4a1e">You're on the launch list</h2>
      <p>We'll notify you when <strong>${categoryName}</strong> goes live.</p>
      <p style="color:#7a6550;font-size:14px">
        You're registered for early access — no action needed until launch day.
      </p>
      <p><a href="${siteUrl}/makhana" style="color:#2c4a1e">Shop plain makhana →</a></p>
      <p style="color:#7a6550;font-size:13px">Team Swastik Makhana · Darbhanga, Bihar</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.port === 465,
    auth: { user: c.user, pass: c.pass },
    ...(c.useTls && c.port !== 465 ? { requireTLS: true } : {}),
  });

  await transporter.sendMail({
    from: `"${c.fromName}" <${c.from}>`,
    to: toEmail,
    replyTo: c.from,
    subject: `Swastik Makhana — ${categoryName} launch alert confirmed`,
    text: plain,
    html,
  });
}
