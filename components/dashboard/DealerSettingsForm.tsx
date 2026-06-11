"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealershipSchema, type DealershipInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, Globe, Phone, Mail, Clock, ImageIcon, Building2, Sparkles } from "lucide-react";
import { FileUpload } from "@/components/common/FileUpload";

interface Props {
  dealership: any;
}

export function DealerSettingsForm({ dealership }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<DealershipInput>({
    resolver: zodResolver(dealershipSchema),
    defaultValues: {
      name: dealership.name,
      description: dealership.description || "",
      category: dealership.category,
      logoUrl: dealership.logoUrl || "",
      coverImageUrl: dealership.coverImageUrl || "",
      businessHours: dealership.businessHours || "",
      email: dealership.email || "",
      phone: dealership.phone || "",
      website: dealership.website || "",
      inventoryUrl: dealership.inventoryUrl || "",
      address: dealership.address || "",
      cityName: dealership.cityName || "",
      stateName: dealership.stateName || "",
      countryId: dealership.countryId,
      postalCode: dealership.postalCode || "",
    },
  });

  const onSubmit = async (data: DealershipInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dealerships/${dealership.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }

      toast({
        title: "Settings updated",
        description: "Your dealership information has been saved.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
    const values = getValues();
    if (!values.name || !values.category || !values.cityName) {
      toast({
        title: "Missing Information",
        description: "Please enter your dealership name, category, and city first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealershipId: dealership.id,
          name: values.name,
          category: values.category,
          city: values.cityName,
          state: values.stateName,
          country: dealership.country?.name || "India",
          website: values.website,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Generation failed");
      }

      const { description, summary } = result.data;
      
      // Update form fields
      setValue("description", `${description}\n\n${summary}`);
      
      toast({
        title: "Profile Generated!",
        description: "Review and edit the generated description below.",
      });
    } catch (error: any) {
      toast({
        title: "AI Generation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Branding Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gold-600" /> Branding
          </CardTitle>
          <CardDescription>
            Update your dealership&apos;s logo and cover image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label>Dealership Logo</Label>
              <Controller
                name="logoUrl"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                    purpose="dealership"
                    label="Logo"
                  />
                )}
              />
              <p className="text-[10px] text-gray-400">Recommended: Square PNG with transparent background.</p>
            </div>
            <div className="space-y-3">
              <Label>Cover Image</Label>
              <Controller
                name="coverImageUrl"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                    purpose="dealership"
                    label="Cover Image"
                  />
                )}
              />
              <p className="text-[10px] text-gray-400">Recommended: 1200x400 high-quality landscape image.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gold-600" /> Basic Information
            </CardTitle>
            <CardDescription>
              General details about your dealership.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="border-gold-600 text-gold-700 hover:bg-gold-50"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI</>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dealership Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell customers about your dealership..."
              rows={5}
              {...register("description")}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gold-600" /> Contact Details
          </CardTitle>
          <CardDescription>
            How customers can reach you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" {...register("phone")} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input id="email" type="email" placeholder="contact@dealer.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input id="website" className="pl-10" placeholder="https://www.yourdealer.com" {...register("website")} />
            </div>
            {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventoryUrl">Live Inventory URL (Premium)</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="inventoryUrl"
                className="pl-10"
                placeholder="https://www.yourdealer.com/inventory"
                {...register("inventoryUrl")}
              />
            </div>
            <p className="text-xs text-gray-500">Shown on your profile when you have a premium plan. Falls back to website if empty.</p>
            {errors.inventoryUrl && <p className="text-xs text-red-500">{errors.inventoryUrl.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Business Hours Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-600" /> Business Hours
          </CardTitle>
          <CardDescription>
            Enter your opening hours (e.g., Monday: 9:00 AM - 6:00 PM).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessHours">Weekly Schedule</Label>
            <Textarea
              id="businessHours"
              placeholder="Monday: 9:00 AM - 6:00 PM&#10;Tuesday: 9:00 AM - 6:00 PM..."
              rows={7}
              {...register("businessHours")}
            />
            {errors.businessHours && <p className="text-xs text-red-500">{errors.businessHours.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold-600 hover:bg-gold-700 text-white min-w-[120px]"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Changes</>
          )}
        </Button>
      </div>
    </form>
  );
}
