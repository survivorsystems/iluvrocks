import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";

process.env.SITE_URL ??=
  process.env.FRONTEND_URL ??
  process.env.CONVEX_SITE_URL ??
  "https://tough-emu-800.convex.site";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
  callbacks: {
    async redirect({ redirectTo }) {
      const baseUrl = (
        process.env.SITE_URL ??
        process.env.FRONTEND_URL ??
        process.env.CONVEX_SITE_URL ??
        "https://tough-emu-800.convex.site"
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
