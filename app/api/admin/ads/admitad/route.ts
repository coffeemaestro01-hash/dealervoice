import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { isAdmitadConfigured, listAdmitadPrograms } from "@/lib/ads/admitad-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAdmitadConfigured()) {
    return NextResponse.json({
      configured: false,
      programs: [],
      message: "Set ADMITAD_CLIENT_ID and ADMITAD_CLIENT_SECRET in environment variables.",
    });
  }

  const programs = await listAdmitadPrograms(100);
  return NextResponse.json({
    configured: true,
    connected: programs.length > 0,
    programs: programs.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      siteUrl: p.site_url,
    })),
  });
}
