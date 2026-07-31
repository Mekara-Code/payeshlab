import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginGateway } from "@/components/admin/admin-login-gateway";
import { getAdminSession } from "@/lib/admin-session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "ورود مدیریت | پایش لب",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return <AdminLoginGateway />;
}
