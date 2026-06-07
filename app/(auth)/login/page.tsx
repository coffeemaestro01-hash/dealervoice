"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Logo, FooterBrand } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Suspense } from "react";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { OAuthErrorHandler } from "@/components/auth/OAuthErrorHandler";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error === "ACCOUNT_SUSPENDED") {
        toast({ title: "Account suspended", description: "Please contact support.", variant: "destructive" });
        return;
      }
      if (result?.error) {
        toast({ title: "Invalid credentials", description: "Check your email and password.", variant: "destructive" });
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Suspense>
        <OAuthErrorHandler />
      </Suspense>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-night-gradient text-white flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px]" />
        <div className="mb-12 relative"><FooterBrand height={34} /></div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative">
          <h2 className="text-3xl font-bold mb-4">Welcome <span className="text-gold">back</span></h2>
          <p className="text-gray-300 text-lg">Access your reviews, track your favourite dealerships, and manage your reputation.</p>
          <div className="mt-10 space-y-4 text-gray-300 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center text-xs font-bold">5.8K</div>
              <span>Dealerships listed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center text-xs font-bold">26</div>
              <span>Countries covered</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="mb-8 lg:hidden inline-block">
            <Logo variant="full" height={30} href={null} />
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
          <p className="text-gray-600 mb-8">
            New to DealerVoice?{" "}
            <Link href="/register" className="text-gold-600 hover:underline font-medium">Create an account</Link>
          </p>

          <SocialAuthButtons callbackUrl={callbackUrl} />
          <AuthDivider />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1"
                {...register("email")}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-gold-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-gold-gradient text-night-900 font-semibold hover:opacity-90 border-0" disabled={isLoading}>
              {isLoading ? <><Loader2 size={16} className="animate-spin mr-2" />Signing in...</> : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
