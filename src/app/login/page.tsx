import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import OrgEntry from "@/components/OrgEntry";

export const dynamic = "force-dynamic";

const HOME: Record<string, string> = {
  cleaner: "/rooms",
  supervisor: "/inspect",
  owner: "/dashboard",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(HOME[session.role] ?? "/rooms");
  return <OrgEntry />;
}
