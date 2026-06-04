import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/onboarding",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) return null;
        if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) {
          throw new Error("ACCOUNT_SUSPENDED");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role ?? UserRole.CUSTOMER;
        token.id = user.id;
        token.roleSyncedAt = Date.now();
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      // Re-sync role from the DB so changes (e.g. claim approval -> DEALER_OWNER)
      // reach the session without a forced re-login. Throttled to once per 60s,
      // or immediately on an explicit session update. Failures are non-fatal.
      const lastSync = (token.roleSyncedAt as number | undefined) ?? 0;
      const stale = Date.now() - lastSync > 60_000;
      if (token.id && (trigger === "update" || stale)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.roleSyncedAt = Date.now();
          }
        } catch {
          // keep existing token.role on DB error
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (existing?.status === UserStatus.BANNED) return false;
      }
      return true;
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }).catch(() => {});
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export type { Session } from "next-auth";
