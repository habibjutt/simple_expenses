import { getAdminStats } from "@/app/api/admin-action";
import { AdminSectionCards } from "@/components/admin-section-cards";
import { AdminChartAreaInteractive } from "@/components/admin-chart-area";
import { AdminDataTable } from "@/components/admin-data-table";
import data from "./data.json";

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AdminSectionCards stats={stats} />
          <div className="px-4 lg:px-6">
            <AdminChartAreaInteractive />
          </div>
          <AdminDataTable data={data} />
        </div>
      </div>
    </div>
  );
}
