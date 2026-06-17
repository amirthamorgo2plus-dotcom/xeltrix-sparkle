import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMyOrg } from "@/app/actions/auth";
import HotelProfile from "@/components/HotelProfile";

export const dynamic = "force-dynamic";

export default async function HotelPage() {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/");
  const org = await getMyOrg();
  if (!org) redirect("/dashboard");
  return <HotelProfile org={org} />;
}
