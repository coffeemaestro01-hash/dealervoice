import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, User } from "lucide-react";

async function getLeads(userId: string) {
  const staff = await prisma.dealerStaff.findFirst({
    where: { userId, isActive: true },
    select: { dealershipId: true }
  });

  if (!staff) return [];

  return await prisma.lead.findMany({
    where: { dealershipId: staff.dealershipId },
    orderBy: { createdAt: "desc" }
  });
}

export default async function DealerLeadsPage() {
  const user = await requireAuth();
  const leads = await getLeads(user.id);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inbound Leads</h1>
        <p className="text-gray-500 mt-1">Manage quote requests and inquiries from your public profile.</p>
      </div>

      {leads.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Mail className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No leads yet</h3>
            <p className="text-gray-500 max-w-xs mt-1">
              When customers request a quote on your public profile, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{lead.name}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={10} /> {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={10} /> {lead.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {lead.type.toLowerCase().replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      lead.status === "NEW" ? "bg-gold-100 text-gold-800 hover:bg-gold-100 border-none" :
                      lead.status === "CONTACTED" ? "bg-blue-100 text-blue-800 border-none" :
                      lead.status === "CONVERTED" ? "bg-green-100 text-green-800 border-none" :
                      "bg-gray-100 text-gray-800 border-none"
                    }>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(lead.createdAt, "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
