import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { authConfig } from "@/config/auth.config";
import { prisma } from "@/lib/prisma";
import { SubscriptionManager } from "@/features/billing/utils";

export const authOptions: NextAuthConfig = {
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",

  events: {
    async createUser({ user }) {
      if (!user?.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingStep: 1, onboardingCompleted: false },
      });
    },
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/onboarding",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24h
  },

  debug: process.env.APP_ENV === "development",

  callbacks: {
    // ✅ Attach user & accessToken to JWT
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.accessToken = account.access_token;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            userType: true,
            isVerified: true,
            onboardingCompleted: true,
            onboardingStep: true,
          },
        });

        if (dbUser) {
          token.userType = dbUser.userType;
          token.isVerified = dbUser.isVerified;
          token.onboardingCompleted = dbUser.onboardingCompleted;
          token.onboardingStep = dbUser.onboardingStep;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.onboardingStep = token.onboardingStep as number;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },

    async signIn({ user }) {
      if (!user?.id) return true;
      try {
        await SubscriptionManager.createDefaultSubscription(user.id);
      } catch (error) {
        console.error("Failed to create default subscription:", error);
      }
      return true;
    },
  },
};

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth(authOptions);
