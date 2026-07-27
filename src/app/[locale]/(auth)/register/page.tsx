"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading, Text } from "@/components/ui/typography";
import { useAuth } from "@/providers/supabase";
import { trackEvent } from "@/lib/analytics/client";
import { apiFetch } from "@/lib/api/client";
import { UserPlus, Mail, User, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const locale = useLocale();
  const router = useRouter();
  const { refresh } = useAuth();
  const [fullName, setFullName] = useState("");
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
      await apiFetch("/api/auth/register", { method: "POST", body: { email, password, fullName } });
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Registration failed");
      setLoading(false);
      return;
    }

    trackEvent("signup", { method: "email" });
    await refresh();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gold-10 border border-gold/20 flex items-center justify-center mx-auto mb-5">
              <UserPlus className="h-5 w-5 text-gold" />
            </div>
            <Heading as="h2" className="mb-2">
              Create Account
            </Heading>
            <Text muted size="sm">
              Join the premium water toys experience
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-[0.625rem] font-medium text-muted-foreground uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[0.625rem] font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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

            <Button type="submit" variant="gold" className="w-full" disabled={loading} size="lg">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <Text muted size="sm">
              Already have an account?{" "}
              <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
