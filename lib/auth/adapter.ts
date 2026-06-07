import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { UserStatus } from "@prisma/client";

/**
 * NextAuth's PrismaAdapter passes `image` to User.create, but our schema uses
 * `avatarUrl` and requires a non-null `name`. Without this wrapper, Google OAuth
 * fails with OAuthCreateAccount.
 */
export function DealerVoicePrismaAdapter(prisma: PrismaClient): Adapter {
  const base = PrismaAdapter(prisma);

  return {
    ...base,
    async createUser(data: Omit<AdapterUser, "id">) {
      const email = data.email?.toLowerCase().trim();
      if (!email) {
        throw new Error("OAuth sign-in requires an email address");
      }

      const user = await prisma.user.create({
        data: {
          email,
          name: data.name?.trim() || email.split("@")[0] || "DealerVoice User",
          emailVerified: data.emailVerified ?? new Date(),
          avatarUrl: data.image ?? null,
          status: UserStatus.ACTIVE,
        },
      });

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.avatarUrl,
      };
    },
    async updateUser({ id, ...data }: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const { image, name, email, emailVerified } = data;

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined && {
            name: name?.trim() || undefined,
          }),
          ...(email !== undefined && {
            email: email?.toLowerCase().trim(),
          }),
          ...(emailVerified !== undefined && { emailVerified }),
          ...(image !== undefined && { avatarUrl: image }),
        },
      });

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.avatarUrl,
      };
    },
  };
}
