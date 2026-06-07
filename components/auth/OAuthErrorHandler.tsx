"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  OAuthSignin: {
    title: "Sign-in failed",
    description: "Could not start Google sign-in. Please try again.",
  },
  OAuthCallback: {
    title: "Sign-in failed",
    description: "Google did not complete sign-in. Check your account and try again.",
  },
  OAuthCreateAccount: {
    title: "Account creation failed",
    description: "We could not create your account via Google. Try email sign-up or contact support.",
  },
  EmailCreateAccount: {
    title: "Account creation failed",
    description: "Could not create an account with that email.",
  },
  Callback: {
    title: "Sign-in error",
    description: "Something went wrong during sign-in. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account already exists",
    description: "This email is linked to another sign-in method. Use your original login.",
  },
  AccessDenied: {
    title: "Access denied",
    description: "Sign-in was cancelled or your account cannot access DealerVoice.",
  },
  Configuration: {
    title: "Sign-in unavailable",
    description: "Google sign-in is temporarily misconfigured. Use email sign-up or try later.",
  },
  Default: {
    title: "Sign-in failed",
    description: "Please try again or create an account with email.",
  },
};

export function OAuthErrorHandler() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const msg = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;
    toast({
      title: msg.title,
      description: msg.description,
      variant: "destructive",
    });
  }, [searchParams, toast]);

  return null;
}
