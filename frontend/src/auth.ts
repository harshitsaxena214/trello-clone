import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  session: { maxAge: 60 * 60 * 2 },
  cookies: {
    sessionToken: {
      name: "taskflow-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google" || !profile?.email_verified)
        return false;

      try {
        const res = await fetch(`${process.env.BACKEND_URL}/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.AUTH_SECRET}`,
          },
          body: JSON.stringify({
            email: profile.email,
            name: profile.name,
            avatar: profile.picture,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
});
