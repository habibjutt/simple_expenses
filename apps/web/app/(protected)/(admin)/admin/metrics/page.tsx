import { getAdminMetrics } from "@/app/api/admin-action";
import { BarChart3, Users, CreditCard, ArrowUpRight } from "lucide-react";
import MetricsChart from "./MetricsChart";
import ErrorBoundary from "@/components/ErrorBoundary";

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{ background: "#0f1e38", borderColor: "#1a2d4a" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
        style={{ background: `${accent}18` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: accent }}>
          {sub}
        </p>
      )}
      <p className="text-sm mt-1" style={{ color: "#64748b" }}>
        {label}
      </p>
    </div>
  );
}

export default async function AdminMetricsPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4" style={{ color: "#4f6ef7" }} />
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "#4f6ef7" }}
          >
            Metrics
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">System Metrics</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Usage and growth data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={metrics.totalUsers}
          sub={`+${metrics.newUsersThisMonth} this month`}
          icon={Users}
          accent="#4f6ef7"
        />
        <MetricCard
          label="Active Subscriptions"
          value={metrics.activeSubscriptions}
          icon={CreditCard}
          accent="#22c55e"
        />
        <MetricCard
          label="Total Transactions"
          value={metrics.totalTransactions.toLocaleString()}
          sub={`${metrics.recentTransactions} this month`}
          icon={ArrowUpRight}
          accent="#22d3ee"
        />
        <MetricCard
          label="Credit Cards"
          value={metrics.totalCreditCards}
          sub={`${metrics.totalBankAccounts} bank accounts`}
          icon={CreditCard}
          accent="#f59e0b"
        />
      </div>

      {/* Chart */}
      {metrics.usersByMonth.length > 0 && (
        <div
          className="rounded-xl border p-5"
          style={{ background: "#0f1e38", borderColor: "#1a2d4a" }}
        >
          <h2 className="text-base font-semibold text-white mb-4">
            User Signups — Last 6 Months
          </h2>
          <ErrorBoundary>
            <MetricsChart data={metrics.usersByMonth} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
