"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/common/FileUpload";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const memberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().min(2, "Title is required"),
  photoUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
});

type MemberInput = z.infer<typeof memberSchema>;

interface Props {
  dealershipId: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TeamMemberForm({ dealershipId, initialData, onSuccess, onCancel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: initialData?.name || "",
      title: initialData?.title || "",
      photoUrl: initialData?.photoUrl || "",
      bio: initialData?.bio || "",
    },
  });

  const onSubmit = async (data: MemberInput) => {
    setIsSubmitting(true);
    try {
      const url = initialData
        ? `/api/dealerships/${dealershipId}/team/${initialData.id}`
        : `/api/dealerships/${dealershipId}/team`;
      
      const res = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save member");

      toast({
        title: initialData ? "Member updated" : "Member added",
        description: `${data.name} has been saved successfully.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save member details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
      <div className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <Label className="mb-2 self-start">Profile Photo</Label>
          <Controller
            name="photoUrl"
            control={control}
            render={({ field }) => (
              <FileUpload
                value={field.value ?? ""}
                onChange={field.onChange}
                onRemove={() => field.onChange("")}
                purpose="avatar"
                className="w-full"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="e.g. Rahul Sharma" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" placeholder="e.g. Sales Manager" {...register("title")} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio (Optional)</Label>
          <Textarea
            id="bio"
            placeholder="A short description of their experience..."
            rows={3}
            {...register("bio")}
          />
          {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold-600 hover:bg-gold-700 text-white min-w-[100px]"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Member"}
        </Button>
      </div>
    </form>
  );
}
