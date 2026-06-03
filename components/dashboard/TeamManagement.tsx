"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getInitials } from "@/lib/utils";
import { TeamMemberForm } from "./TeamMemberForm";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  photoUrl: string | null;
  bio: string | null;
  sortOrder: number;
}

interface Props {
  dealershipId: string;
  initialMembers: TeamMember[];
}

export function TeamManagement({ dealershipId, initialMembers }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReorder = async (newOrder: TeamMember[]) => {
    // Optimistic update
    setMembers(newOrder);

    try {
      const payload = newOrder.map((m, index) => ({
        id: m.id,
        sortOrder: index,
      }));

      const res = await fetch(`/api/dealerships/${dealershipId}/team/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to reorder");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save new order. Please refresh.",
        variant: "destructive",
      });
      // Revert on error
      setMembers(initialMembers);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const res = await fetch(`/api/dealerships/${dealershipId}/team/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setMembers(members.filter((m) => m.id !== memberId));
      toast({ title: "Member removed", description: "Team member has been deleted." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member.",
        variant: "destructive",
      });
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="bg-gold-600 hover:bg-gold-700 text-white font-bold">
          <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
        </Button>
      </div>

      {members.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Plus className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No team members yet</h3>
            <p className="text-gray-500 max-w-xs mt-1 mb-6">
              Add your staff members to show the faces behind your dealership.
            </p>
            <Button onClick={handleOpenAdd} variant="outline" className="border-gold-600 text-gold-700">
              Add your first member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Reorder.Group axis="y" values={members} onReorder={handleReorder} className="space-y-3">
          {members.map((member) => (
            <Reorder.Item
              key={member.id}
              value={member}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gold-300 transition-colors"
            >
              <div className="p-4 flex items-center gap-4">
                <GripVertical className="text-gray-300 cursor-grab active:cursor-grabbing shrink-0" size={20} />
                
                <Avatar className="h-12 w-12 border border-gray-100 shadow-sm shrink-0">
                  <AvatarImage src={member.photoUrl ?? undefined} className="object-cover" />
                  <AvatarFallback className="bg-gold-50 text-gold-700 font-bold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{member.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{member.title}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(member)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member" : "Add Team Member"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Update the details for this staff member." : "Fill in the details to add a new member to your team."}
            </DialogDescription>
          </DialogHeader>
          
          <TeamMemberForm
            dealershipId={dealershipId}
            initialData={editingMember}
            onSuccess={() => {
              setIsFormOpen(false);
              router.refresh();
              // In a real app, I'd probably use React Query or a manual state update,
              // but for now, router.refresh() will update the server component data.
              // I'll also trigger a reload of local state.
              fetch(`/api/users/me/dealership`) // Assuming this might help or just wait for refresh
                .then(() => window.location.reload());
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
