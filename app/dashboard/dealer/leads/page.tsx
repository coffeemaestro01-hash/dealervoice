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
import { DealerLeadActions } from "@/components/dashboard/DealerLeadActions";
import { Mail, Phone } from "lucide-react";

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
        <h1 className="text-2xl font-bold text-foreground">Inbound Leads</h1>
        <p className="text-muted-foreground mt-1">Manage quote requests and inquiries from your public profile.</p>
      </div>

      {leads.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No leads yet</h3>
            <p className="text-muted-foreground max-w-xs mt-1">
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
                      <span className="font-bold text-foreground">{lead.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail size={10} /> {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone size={10} /> {lead.phone}
                        </span>
                      )}
                      <DealerLeadActions leadId={lead.id} status={lead.status} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {lead.type.toLowerCase().replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      lead.status === "NEW" ? "bg-primary/10 text-primary hover:bg-primary/10 border-none" :
                      lead.status === "CONTACTED" ? "bg-muted text-primary border-none" :
                      lead.status === "CONVERTED" ? "bg-muted text-primary border-none" :
                      "bg-muted text-foreground border-none"
                    }>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
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
