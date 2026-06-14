import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAllStaff } from "@/app/actions/auth";
import Heading from "@/components/Heading";
import StaffManager from "@/components/StaffManager";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/");

  const staff = await getAllStaff();

  return (
    <div>
      <Heading tkey="manageStaff" />
      <StaffManager staff={staff} />
    </div>
  );
}
