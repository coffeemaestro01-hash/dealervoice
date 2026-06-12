"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send } from "lucide-react";

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  vehicle: z.string().optional(),
  message: z.string().min(10, "Please provide more details"),
});

type LeadInput = z.infer<typeof leadSchema>;

interface Props {
  dealerId: string;
  dealerName: string;
}

export function LeadForm({ dealerId, dealerName }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, dealershipId: dealerId }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      toast({
        title: "Request Sent!",
        description: `Your request has been sent to ${dealerName}. They will contact you shortly.`,
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card id="request-quote" className="rounded-2xl border-gold-100 shadow-lg shadow-gold-500/5 overflow-hidden border-2">
      <CardHeader className="bg-gold-50/50 border-b border-gold-100">
        <CardTitle className="text-xl font-bold text-gray-900">Request a Quote</CardTitle>
        <CardDescription className="text-gray-600">
          Get the best price directly from {dealerName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (312) 555-0100" {...register("phone")} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Interested Vehicle (Optional)</Label>
            <Input id="vehicle" placeholder="2024 Toyota Camry" {...register("vehicle")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="I'm interested in this vehicle and would like to know the best price and availability."
              rows={3}
              {...register("message")}
            />
            {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold h-12 shadow-lg shadow-gold-600/20"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Send Request</>
            )}
          </Button>
          <p className="text-[10px] text-gray-400 text-center">
            By submitting, you agree to be contacted by this dealer.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
