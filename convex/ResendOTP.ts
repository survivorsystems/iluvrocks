import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.RESEND_API_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes, (b) => (b % 10).toString()).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { data, error } = await resend.emails.send({
      from: "RockHound <auth@survivorsystems.org>",
      to: [email],
      subject: `${token} is your RockHound sign-in code`,
      text: [
        `Your RockHound sign-in code is ${token}.`,
        "",
        "This code expires in 15 minutes.",
        "If you did not request this code, you can ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #27313a; line-height: 1.5;">
          <h1 style="font-size: 22px;">Your RockHound sign-in code</h1>
          <p>Built by rockhounds, for rockhounds.</p>
          <p>Use this code to finish signing in:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 4px;">${token}</p>
          <p>This code expires in 15 minutes.</p>
          <p style="color: #66717a;">If you did not request this code, you can ignore this email.</p>
        </div>
      `,
    });
    if (error) {
      throw new Error(JSON.stringify(error));
    }
    console.log(`Sent RockHound sign-in email via Resend: ${data?.id ?? "no id returned"}`);
  },
});
