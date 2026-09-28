import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authenticateCredentials } from "@/lib/auth/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const requestIdentifier = forwardedFor ?? "unknown";

        return authenticateCredentials(credentials, requestIdentifier);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        token.username = user.username;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId;
      session.user.username = token.username;

      return session;
    },
  },
});
