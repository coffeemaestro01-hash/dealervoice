import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") {
    redirect("/dashboard");
  }

  const claims = await prisma.dealerClaim.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      dealership: { select: { id: true, name: true, slug: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      documents: true,
    },
  });

  // Sort PENDING to top manually just in case enum sorting isn't alphabetical
  claims.sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (b.status === "PENDING" && a.status !== "PENDING") return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dealer Claims</h1>
        <p className="text-gray-500 mt-2">Review and process ownership claims for dealerships.</p>
      </div>

      {claims.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-900">No claims yet</h3>
            <p className="text-gray-500 mt-1">There are no dealership claims to review at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {claims.map((claim) => (
            <Card key={claim.id} className={claim.status === "PENDING" ? "border-gold-300 shadow-md" : ""}>
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Link href={`/dealership/${claim.dealership.slug}`} className="hover:underline text-blue-600" target="_blank">
                      {claim.dealership.name}
                    </Link>
                    <Badge variant="outline" className={
                      claim.status === "PENDING" ? "bg-amber-100 text-amber-800 border-amber-200" :
                      claim.status === "APPROVED" ? "bg-green-100 text-green-800 border-green-200" :
                      "bg-red-100 text-red-800 border-red-200"
                    }>
                      {claim.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Submitted {format(claim.createdAt, "MMM d, yyyy 'at' h:mm a")} by <span className="font-medium text-gray-900">{claim.submittedBy.name}</span> ({claim.submittedBy.email})
                  </CardDescription>
                </div>

                {claim.status === "PENDING" && (
                  <form action={async () => {
                    "use server";
                    // Only for demonstration, actual mutation should be via a client form or transition, 
                    // but we can rely on the API route created. We will just link to the API or handle via client component if needed.
                    // For simplicity, we'll keep the UI purely display here and assume the client fetches the API.
                  }}>
                    {/* Interactive buttons would typically be a Client Component. We can use standard HTML forms or a Client Wrapper. */}
                  </form>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">Business Email</p>
                    <p className="text-gray-600">{claim.businessEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">Business Phone</p>
                    <p className="text-gray-600">{claim.businessPhone || "N/A"}</p>
                  </div>
                </div>

                {claim.notes && (
                  <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-900">Notes from applicant</p>
                    <p className="text-gray-600 italic">"{claim.notes}"</p>
                  </div>
                )}

                {claim.documents && claim.documents.length > 0 && (
                  <div className="space-y-2 text-sm pt-2">
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText size={16} /> Attached Documents
                    </p>
                    <div className="flex flex-col gap-2">
                      {claim.documents.map((doc) => (
                        <a 
                          key={doc.id} 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={14} /> {doc.filename || "Proof of Ownership Document"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approver actions - Normally this would be extracted to a Client Component, 
                    but for brevity we just render static placeholders if not using use client. 
                    Let's convert this to a simple form that calls the API or uses a client component. 
                */}
                {claim.status === "PENDING" && (
                  <div className="flex items-center gap-3 pt-4 border-t mt-4">
                    <AdminClaimActions claimId={claim.id} />
                  </div>
                )}
                
                {claim.status === "REJECTED" && claim.rejectionReason && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-sm mt-4">
                    <p className="font-semibold">Rejection Reason:</p>
                    <p>{claim.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline client component for actions
import { AdminClaimActions } from "./AdminClaimActions";
