import { getAdminStats } from "@/app/api/admin-action";
import { AdminSectionCards } from "@/components/admin-section-cards";

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AdminSectionCards stats={stats} />
        </div>
      </div>
    </div>
  );
}
