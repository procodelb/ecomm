"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading, Text } from "@/components/ui/typography";
import { useAuth } from "@/providers/supabase";
import { trackEvent } from "@/lib/analytics/client";
import { apiFetch } from "@/lib/api/client";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Login failed");
      setLoading(false);
      return;
    }

    trackEvent("login", { method: "email" });
    await refresh();
    const redirect = searchParams.get("redirect") || `/${locale}`;
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <Heading as="h2" className="mb-2">
              Welcome Back
            </Heading>
            <Text muted size="sm">
              Sign in to your account to continue
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[0.625rem] font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[0.625rem] font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <Text size="sm" className="text-destructive">{error}</Text>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <Link href={`/${locale}/forgot-password`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Forgot your password?
            </Link>
            <div className="w-full border-t border-border pt-4">
              <Text muted size="sm">
                Don&apos;t have an account?{" "}
                <Link href={`/${locale}/register`} className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
