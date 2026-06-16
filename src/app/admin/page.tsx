import AdminConsole from "@/components/AdminConsole";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <AdminConsole />
    </div>
  );
}
