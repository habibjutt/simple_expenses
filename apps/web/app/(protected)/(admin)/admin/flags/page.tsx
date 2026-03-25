import { getFeatureFlags } from "@/app/api/admin-action";
import { Flag } from "lucide-react";
import FlagsTable from "./FlagsTable";

export default async function AdminFlagsPage() {
  const flags = await getFeatureFlags();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4" style={{ color: "#4f6ef7" }} />
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: "#4f6ef7" }}
            >
              Feature Flags
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {flags.length} flag{flags.length !== 1 ? "s" : ""} configured
          </p>
        </div>
      </div>

      <FlagsTable flags={flags} />
    </div>
  );
}
