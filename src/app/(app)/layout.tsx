import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-stone-50">
      <TopBar name={session.name} role={session.role} />
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav role={session.role} />
    </div>
  );
}
