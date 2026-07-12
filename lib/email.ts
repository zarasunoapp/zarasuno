import nodemailer from "nodemailer";

// SPACEMAIL SMTP — server-only. Same template/design as the admin side so
// payment emails look consistent no matter where they're sent from.
function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: String(process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const BRAND = "#0B5D4B";
const GOLD = "#D9A94C";

function coinsEmailHtml({ name, coins, balance, packageName }: { name?: string; coins: number; balance?: number; packageName?: string }) {
  const hi = name ? `Hi ${name},` : "Hi there,";
  return `
  <div style="margin:0;padding:0;background:#f4f1ea;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.06);">
          <tr><td style="background:${BRAND};padding:28px 32px;text-align:center;">
            <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:.5px;">Zara<span style="color:${GOLD};">Suno</span></div>
            <div style="font-size:11px;color:#cfe3dc;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Audio Book Summaries</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:16px;color:#14211d;">${hi}</p>
            <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4b5563;">
              Your payment was successful and your coins have been added to your ZaraSuno account. 🎉
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ea;border:1px solid #efe6d4;border-radius:14px;">
              <tr><td style="padding:20px 24px;text-align:center;">
                <div style="font-size:13px;color:#6b7280;">Coins added</div>
                <div style="font-size:34px;font-weight:800;color:${BRAND};line-height:1.2;">+${coins}</div>
                ${packageName ? `<div style="font-size:12px;color:#9ca3af;">${packageName} pack</div>` : ""}
                ${typeof balance === "number" ? `<div style="margin-top:10px;font-size:13px;color:#374151;">New balance: <b style="color:${BRAND};">${balance} coins</b></div>` : ""}
              </td></tr>
            </table>
            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">
              You can now unlock and enjoy your books. Happy listening! 💛
            </p>
          </td></tr>
          <tr><td style="padding:18px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
            <div style="font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ZaraSuno · Sydney, Australia</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

export async function sendCoinsEmail(opts: {
  to: string;
  name?: string;
  coins: number;
  balance?: number;
  packageName?: string;
}): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !opts.to) return; // not configured → skip silently
  await transport().sendMail({
    from: process.env.EMAIL_FROM ?? `ZaraSuno <${process.env.SMTP_USER}>`,
    to: opts.to,
    subject: `You've got ${opts.coins} coins ✨ — payment successful`,
    html: coinsEmailHtml(opts),
  });
}
