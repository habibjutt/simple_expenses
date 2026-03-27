"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  KeyRound,
  Bell,
  Palette,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ChangePasswordModal from "@/components/change-password-modal";
import DeleteAccountModal from "@/components/delete-account-modal";
import { SUPPORTED_CURRENCIES } from "@/lib/utils";
import { updatePreferredCurrency } from "@/app/api/user-action";
import { FormCombobox } from "@/components/ui/form-combobox";

type AlertState = { type: "success" | "error"; message: string } | null;

function AlertBanner({
  alert,
  onDismiss,
}: {
  alert: AlertState;
  onDismiss: () => void;
}) {
  if (!alert) return null;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-4 ${
        alert.type === "success"
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      {alert.type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
      )}
      <span className="flex-1">{alert.message}</span>
      <button
        onClick={onDismiss}
        className="text-xs opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [preferredCurrency, setPreferredCurrency] = useState("AED");
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setDisplayName(session.user.name);
    }
    const userRecord = session?.user as
      | { preferredCurrency?: string }
      | undefined;
    if (userRecord?.preferredCurrency) {
      setPreferredCurrency(userRecord.preferredCurrency);
    }
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setAlert({ type: "error", message: "Display name cannot be empty." });
      return;
    }
    setSavingProfile(true);
    setAlert(null);
    try {
      await authClient.updateUser({ name: displayName.trim() });
      setAlert({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        message: (err as Error).message || "Failed to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCurrency = async () => {
    setSavingCurrency(true);
    setAlert(null);
    try {
      const result = await updatePreferredCurrency(preferredCurrency);
      if (result?.error) {
        setAlert({ type: "error", message: result.error });
      } else {
        setAlert({ type: "success", message: "Currency preference saved!" });
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: (err as Error).message || "Failed to save currency.",
      });
    } finally {
      setSavingCurrency(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-500 text-sm">Loading…</div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      <main className="pb-24 lg:pb-8">
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <h1 className="text-lg font-bold">Settings</h1>
            <p className="text-white/60 text-sm mt-0.5">
              Manage your profile, security and preferences
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 space-y-5">
          <AlertBanner alert={alert} onDismiss={() => setAlert(null)} />

          {/* Profile Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#1a9e5c]/10 flex items-center justify-center">
                <User className="h-4 w-4 text-[#1a9e5c]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Update your display name and account information
                </p>
              </div>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-[#1a9e5c] flex items-center justify-center text-white text-xl font-bold">
                  {displayName?.charAt(0)?.toUpperCase() ||
                    session.user.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {displayName || session.user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="display-name"
                    className="text-xs font-medium text-slate-600"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="max-w-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Email Address
                  </Label>
                  <Input
                    value={session.user.email || ""}
                    disabled
                    className="max-w-xs bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400">
                    Email address cannot be changed
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white"
                >
                  {savingProfile ? "Saving…" : "Save Profile"}
                </Button>
              </form>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Security
                </h2>
                <p className="text-xs text-slate-500">
                  Manage your password and account security
                </p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">Password</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Last changed: not tracked
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                  className="border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Notifications
                </h2>
                <p className="text-xs text-slate-500">
                  Control how you receive alerts
                </p>
              </div>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Bill due reminders
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Get notified 7 days before invoice due dates
                  </p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2.5 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Palette className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Preferences
                </h2>
                <p className="text-xs text-slate-500">
                  Customize your experience
                </p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-3">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Preferred Currency
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Default currency for new accounts and cards
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <FormCombobox
                    value={preferredCurrency}
                    onValueChange={(v) => setPreferredCurrency(v || "AED")}
                    options={SUPPORTED_CURRENCIES.map((c) => ({
                      value: c.code,
                      label: `${c.code} — ${c.name}`,
                    }))}
                    placeholder="Select currency…"
                    searchPlaceholder="Search currency…"
                    emptyText="No currency found."
                    className="w-56"
                  />
                  <Button
                    size="sm"
                    disabled={savingCurrency}
                    onClick={handleSaveCurrency}
                    className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white"
                  >
                    {savingCurrency ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Dark Mode
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Switch between light and dark theme
                  </p>
                </div>
                <span className="text-xs bg-slate-200 text-slate-600 font-medium px-2.5 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-red-50">
              <h2 className="text-sm font-semibold text-red-600">
                Danger Zone
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Irreversible actions — proceed with caution
              </p>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Delete Account
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <ChangePasswordModal
        open={showPasswordModal}
        setOpen={setShowPasswordModal}
      />
      <DeleteAccountModal
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        userEmail={session.user.email || ""}
      />
    </div>
  );
}
