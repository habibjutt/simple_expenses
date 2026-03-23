"use client";

import { useState, useTransition } from "react";
import { toggleFeatureFlag, createFeatureFlag, deleteFeatureFlag } from "@/app/api/admin-action";
import { Plus, Trash2 } from "lucide-react";

type Flag = {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: Date;
};

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
      style={{ background: enabled ? "#4f6ef7" : "#1a2d4a" }}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
        style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

export default function FlagsTable({ flags }: { flags: Flag[] }) {
  const [, startTransition] = useTransition();
  const [showNew, setShowNew] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleToggle = (key: string, enabled: boolean) => {
    startTransition(async () => {
      await toggleFeatureFlag(key, enabled);
    });
  };

  const handleCreate = () => {
    if (!newKey.trim()) return;
    startTransition(async () => {
      await createFeatureFlag({ key: newKey.trim(), description: newDesc.trim() || undefined });
      setNewKey("");
      setNewDesc("");
      setShowNew(false);
    });
  };

  const handleDelete = (key: string) => {
    if (!confirm(`Delete flag "${key}"?`)) return;
    startTransition(async () => {
      await deleteFeatureFlag(key);
    });
  };

  const inputStyle = {
    background: "#070c1a",
    borderColor: "#1a2d4a",
    color: "#e2e8f0",
  };

  return (
    <div className="space-y-4">
      {/* New flag form */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNew((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "#4f6ef7", color: "white" }}
        >
          <Plus className="w-4 h-4" />
          New Flag
        </button>
      </div>

      {showNew && (
        <div
          className="rounded-xl border p-5 space-y-3"
          style={{ background: "#0f1e38", borderColor: "#1a2d4a" }}
        >
          <h3 className="text-sm font-semibold text-white">Create New Flag</h3>
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Flag key (e.g. new-dashboard)"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={inputStyle}
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={inputStyle}
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowNew(false)}
              className="flex-1 py-2 rounded-lg border text-sm font-medium"
              style={{ borderColor: "#1a2d4a", color: "#94a3b8" }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newKey.trim()}
              className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ background: "#4f6ef7", color: "white" }}
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
      >
        {/* Mobile card list */}
        <div className="md:hidden divide-y" style={{ borderColor: "#1a2d4a" }}>
          {flags.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>
              No feature flags yet. Create your first one above.
            </p>
          ) : (
            flags.map((f) => (
              <div key={f.id} className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="font-mono text-sm" style={{ color: "#a5b4ff" }}>{f.key}</span>
                  {f.description && (
                    <p className="text-xs truncate" style={{ color: "#64748b" }}>{f.description}</p>
                  )}
                  <p className="text-xs" style={{ color: "#3d5a80" }}>
                    Updated {new Date(f.updatedAt).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Toggle enabled={f.enabled} onChange={(v) => handleToggle(f.key, v)} />
                  <button
                    onClick={() => handleDelete(f.key)}
                    className="p-1.5 rounded-lg border text-red-500 transition-colors hover:bg-red-500/10"
                    style={{ borderColor: "#1a2d4a" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1a2d4a" }}>
                {["Flag Key", "Description", "Status", "Last Updated", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#3d5a80" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#1a2d4a" }}>
              {flags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                    No feature flags yet. Create your first one above.
                  </td>
                </tr>
              ) : (
                flags.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm" style={{ color: "#a5b4ff" }}>
                        {f.key}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: "#64748b" }}>
                      {f.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Toggle
                          enabled={f.enabled}
                          onChange={(v) => handleToggle(f.key, v)}
                        />
                        <span className="text-xs" style={{ color: f.enabled ? "#22c55e" : "#64748b" }}>
                          {f.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#64748b" }}>
                      {new Date(f.updatedAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(f.key)}
                        className="p-1.5 rounded-lg border text-red-500 transition-colors hover:bg-red-500/10"
                        style={{ borderColor: "#1a2d4a" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
