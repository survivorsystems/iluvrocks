import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

const convexSiteUrl =
  process.env.CONVEX_SITE_URL ??
  process.env.VITE_CONVEX_SITE_URL ??
  "https://outstanding-chicken-449.convex.site";
const siteUrl = process.env.SITE_URL ?? process.env.FRONTEND_URL ?? "https://iluvrocks.rocks";

process.env.CONVEX_SITE_URL ??= convexSiteUrl;
process.env.SITE_URL ??= siteUrl;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements(password) {
        validateRockHoundPassword(password);
      },
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
          throw new Error("A valid email is required");
        }

        return {
          email,
          name: String(params.name ?? email.split("@")[0]).trim(),
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      const baseUrl = (
        process.env.SITE_URL ??
        process.env.FRONTEND_URL ??
        "https://iluvrocks.rocks"
      ).replace(/\/$/, "");

      if (redirectTo.startsWith("?") || redirectTo.startsWith("/")) {
        return `${baseUrl}${redirectTo}`;
      }

      if (redirectTo.startsWith(baseUrl)) {
        return redirectTo;
      }

      return `${baseUrl}/profile`;
    },
  },
});

function validateRockHoundPassword(password: string) {
  if (
    password.length < 9 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error(
      "Password must be at least 9 characters and include 1 uppercase letter, 1 number, and 1 special character",
    );
  }
}
