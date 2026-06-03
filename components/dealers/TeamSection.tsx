import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  photoUrl: string | null;
  bio: string | null;
}

interface Props {
  members: TeamMember[];
  dealerName: string;
}

export function TeamSection({ members, dealerName }: Props) {
  if (members.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Meet the Team</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {members.map((member) => (
          <div key={member.id} className="text-center group">
            <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32 mb-4">
              <Avatar className="w-full h-full border-2 border-gray-100 shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={member.photoUrl ?? undefined} className="object-cover" />
                <AvatarFallback className="bg-gold-50 text-gold-700 text-xl font-bold">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">
              {member.name}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {member.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
