"use server";

import { redirect } from "next/navigation";
import { authenticateAdmin, clearAdminSession, createAdminSession } from "@/lib/admin-session";

export type AdminLoginState = {
  message?: string;
};

const invalidCredentialsMessage = "اطلاعات ورود صحیح نیست یا دسترسی شما فعال نشده است.";

export async function signInAdmin(_previousState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return { message: invalidCredentialsMessage };
  }

  if (email.length > 254 || password.length > 128) {
    return { message: invalidCredentialsMessage };
  }

  try {
    const user = await authenticateAdmin(email, password);
    if (!user) {
      return { message: invalidCredentialsMessage };
    }

    await createAdminSession(user);
  } catch {
    return { message: invalidCredentialsMessage };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
