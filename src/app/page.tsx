import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStaffList } from "@/app/actions/auth";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

const HOME: Record<string, string> = {
  cleaner: "/rooms",
  supervisor: "/inspect",
  owner: "/dashboard",
};

export default async function Page() {
  const session = await getSession();
  if (session) redirect(HOME[session.role] ?? "/rooms");
  const staff = await getStaffList();
  return <LoginForm staff={staff} />;
}
