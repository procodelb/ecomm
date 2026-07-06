"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { ShieldAlert, LogIn, UserPlus } from "lucide-react";

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  access_denied: {
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
  },
  expired_token: {
    title: "Expired Link",
    message: "This link has expired. Please try again.",
  },
  invalid_token: {
    title: "Invalid Link",
    message: "This link is invalid. Please check the URL and try again.",
  },
  session_expired: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again.",
  },
  general: {
    title: "Authentication Error",
    message: "Something went wrong during authentication.",
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") ?? "general";
  const errorInfo = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.general;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="h-5 w-5 text-destructive" />
          </div>
          <Heading as="h2" gradient="primary" className="mb-3">
            {errorInfo.title}
          </Heading>
          <Text muted className="mb-8">
            {errorInfo.message}
          </Text>

          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline w-full">
              <UserPlus className="h-3.5 w-3.5" />
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
