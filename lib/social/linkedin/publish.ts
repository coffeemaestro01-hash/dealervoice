import crypto from "crypto";
import prisma from "@/lib/db";
import { getMarketCoverageStats } from "@/lib/marketing/coverage-stats";
import {
  expandLinkedInPool,
  renderPost,
  type LinkedInPostTemplate,
} from "@/lib/social/linkedin/content";
import { createLinkedInPost, linkedInConfigured, uploadLinkedInImage } from "@/lib/social/linkedin/client";
import { getLinkedInConnectionMeta } from "@/lib/social/linkedin/credentials";
import { getLinkedInSetupInfo } from "@/lib/social/linkedin/oauth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
const REUSE_DAYS = 14;

async function buildContext() {
  const coverage = await getMarketCoverageStats();
  const reviewCount = await prisma.review.count({ where: { status: "PUBLISHED" } });
  return {
    appUrl: APP_URL,
    dealerCount: coverage.usTotal,
    ilDealerCount: coverage.il,
    reviewCount,
    chicagolandCount: coverage.chicagoland,
  };
}

async function pickTemplate(pool: LinkedInPostTemplate[]): Promise<LinkedInPostTemplate> {
  const since = new Date(Date.now() - REUSE_DAYS * 24 * 60 * 60 * 1000);
  const recent = await prisma.socialPostLog.findMany({
    where: { platform: "linkedin", postedAt: { gte: since }, status: "posted" },
    select: { templateKey: true },
  });
  const used = new Set(recent.map((r) => r.templateKey));
  const available = pool.filter((t) => !used.has(t.key));
  const pickFrom = available.length > 0 ? available : pool;
  const slot = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  return pickFrom[slot % pickFrom.length]!;
}

async function fetchPostImage(theme: string): Promise<Buffer | null> {
  try {
    const url = `${APP_URL}/api/social/linkedin-image?theme=${encodeURIComponent(theme)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function publishNextLinkedInPost(opts?: { dryRun?: boolean }) {
  const pool = expandLinkedInPool();
  const template = await pickTemplate(pool);
  const ctx = await buildContext();
  const body = renderPost(template, ctx);
  const contentHash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 32);
  const imageUrl = `${APP_URL}/api/social/linkedin-image?theme=${template.imageTheme}`;
  const link = template.link?.(ctx) ?? APP_URL;

  if (opts?.dryRun) {
    return { dryRun: true, templateKey: template.key, body, imageUrl, videoUrl: template.videoUrl };
  }

  const dup = await prisma.socialPostLog.findUnique({
    where: { platform_contentHash: { platform: "linkedin", contentHash } },
  });
  if (dup) {
    return { skipped: true, reason: "duplicate", templateKey: template.key };
  }

  if (!(await linkedInConfigured())) {
    await prisma.socialPostLog.create({
      data: {
        platform: "linkedin",
        templateKey: template.key,
        contentHash,
        body,
        imageUrl,
        videoUrl: template.videoUrl,
        status: "failed",
        error: "LinkedIn not connected — Admin → LinkedIn autopilot → Connect LinkedIn",
      },
    });
    return { skipped: true, reason: "not_configured", templateKey: template.key, body, imageUrl };
  }

  try {
    let imageUrn: string | undefined;
    const png = await fetchPostImage(template.imageTheme);
    if (png) {
      imageUrn = await uploadLinkedInImage(png);
    }

    const externalId = await createLinkedInPost({
      commentary: body,
      imageUrn,
      articleUrl: imageUrn ? undefined : link,
    });

    await prisma.socialPostLog.create({
      data: {
        platform: "linkedin",
        templateKey: template.key,
        contentHash,
        body,
        imageUrl,
        videoUrl: template.videoUrl,
        externalId,
        status: "posted",
      },
    });

    return { posted: true, templateKey: template.key, externalId, imageUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "LinkedIn post failed";
    await prisma.socialPostLog.create({
      data: {
        platform: "linkedin",
        templateKey: template.key,
        contentHash,
        body,
        imageUrl,
        status: "failed",
        error: message,
      },
    });
    throw err;
  }
}

export async function getLinkedInSocialStatus() {
  const recent = await prisma.socialPostLog.findMany({
    where: { platform: "linkedin" },
    orderBy: { postedAt: "desc" },
    take: 12,
  });
  const next = await publishNextLinkedInPost({ dryRun: true });
  const connection = await getLinkedInConnectionMeta();
  const setup = getLinkedInSetupInfo();
  return {
    configured: await linkedInConfigured(),
    connection,
    setup,
    recent,
    nextPreview: next,
    poolSize: expandLinkedInPool().length,
    schedule: "Daily at 14:00 UTC (Vercel Hobby: 1×/day; use n8n for more)",
  };
}
