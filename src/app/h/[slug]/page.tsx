import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrgBySlug, getStaffList } from "@/app/actions/auth";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

const HOME: Record<string, string> = {
  cleaner: "/rooms",
  supervisor: "/inspect",
  owner: "/dashboard",
};

export default async function HotelLogin({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);
  if (!org) notFound();

  const session = await getSession();
  if (session && session.orgSlug === slug) {
    redirect(HOME[session.role] ?? "/rooms");
  }

  const staff = await getStaffList(org.id);
  return <LoginForm staff={staff} orgName={org.name} />;
}
