"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

export default function AccountSettings() {
  const [profile, setProfile] = useState({
    email: "", firstName: "", lastName: "", phone: "",
    preferredLocale: "en-AE", preferredCurrency: "AED",
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        setProfile({
          email: p.email || "",
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          phone: p.phone || "",
          preferredLocale: p.preferredLocale || "en-AE",
          preferredCurrency: p.preferredCurrency || "AED",
          marketingConsent: p.marketingConsent || false,
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await apiFetch("/api/account/profile", {
      method: "PATCH", body: profile,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Account Settings</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">Profile</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">First Name</label>
              <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name</label>
              <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
            <input value={profile.email} disabled className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed" />
            <p className="text-[10px] text-muted-foreground/40 mt-1">Email cannot be changed here</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Preferred Language</label>
              <select value={profile.preferredLocale} onChange={(e) => setProfile({ ...profile, preferredLocale: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                <option value="en-AE">English (UAE)</option>
                <option value="en-AU">English (Australia)</option>
                <option value="ar-AE">العربية (الإمارات)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Preferred Currency</label>
              <select value={profile.preferredCurrency} onChange={(e) => setProfile({ ...profile, preferredCurrency: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                <option value="AED">AED</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={profile.marketingConsent} onChange={(e) => setProfile({ ...profile, marketingConsent: e.target.checked })} className="h-4 w-4 accent-primary" />
              <span className="text-sm text-muted-foreground">Receive marketing emails</span>
            </label>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Account Security</h2>
            <p className="text-sm text-muted-foreground mb-4">Manage your password and authentication settings</p>
            <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground/90 transition-colors">
              Change Password
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Preferences</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Updates</span>
                <span className="text-foreground/80">Email</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping Notifications</span>
                <span className="text-foreground/80">Email</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Marketing</span>
                <span className="text-foreground/80">{profile.marketingConsent ? "Subscribed" : "Unsubscribed"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
