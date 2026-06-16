import { MapPin, Phone, Globe, Mail, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Props {
  dealer: any;
}

export function DealerContactSidebar({ dealer }: Props) {
  const address = [
    dealer.address,
    dealer.address2,
    [dealer.cityName, dealer.stateCode, dealer.postalCode].filter(Boolean).join(" "),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border">
          <CardTitle className="text-lg font-bold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">Location</p>
              {address.map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground">{line}</p>
              ))}
            </div>
          </div>

          <Separator className="bg-muted" />

          {dealer.phone && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Phone</p>
                <a href={`tel:${dealer.phone}`} className="text-sm text-primary font-medium hover:underline">
                  {dealer.phone}
                </a>
              </div>
            </div>
          )}

          {dealer.email && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Email</p>
                <a href={`mailto:${dealer.email}`} className="text-sm text-primary font-medium hover:underline">
                  {dealer.email}
                </a>
              </div>
            </div>
          )}

          {dealer.website && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <Globe size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-0.5">Website</p>
                <a
                  href={dealer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <span className="truncate">{dealer.website.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {dealer.businessHours && (
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock size={20} className="text-primary" /> Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2.5">
              {dealer.businessHours.split("\n").map((line: string, i: number) => {
                const [day, hours] = line.split(":");
                return (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">{day?.trim()}</span>
                    <span className="text-foreground">{hours?.trim()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
