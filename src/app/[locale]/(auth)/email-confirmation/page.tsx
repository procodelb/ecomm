"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Loader2, XCircle, CheckCircle, LogIn } from "lucide-react";

export default function EmailConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type") ?? "signup";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("success");
      return;
    }

    async function verify() {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Verification failed");
        setStatus("error");
        return;
      }

      setStatus("success");
    }

    verify();
  }, [token, type]);

  if (status === "verifying" && token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary-10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
            <Heading as="h3" gradient="primary" className="mb-2">
              Verifying...
            </Heading>
            <Text muted>Please wait while we verify your email.</Text>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-5">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <Heading as="h3" gradient="primary" className="mb-2">
              Verification Failed
            </Heading>
            <Text muted className="mb-6">
              {error || "The verification link is invalid or has expired."}
            </Text>
            <Link href="/login" className="inline-block text-sm text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <Heading as="h3" gradient="gold" className="mb-2">
            Email Confirmed
          </Heading>
          <Text muted className="mb-6">
            {type === "signup"
              ? "Your email has been verified. You can now sign in."
              : "Your email change has been confirmed."}
          </Text>
          <Link href="/login">
            <Button className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
