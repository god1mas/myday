"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { auth, signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/validation/login";

const GENERIC_LOGIN_ERROR = "Username atau password salah.";

export type LoginFormState = {
  error: string | null;
  fieldErrors: {
    username?: string[];
    password?: string[];
  };
};

export async function login(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      error: null,
      fieldErrors: {
        username: fieldErrors.username,
        password: fieldErrors.password,
      },
    };
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: "/today",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: GENERIC_LOGIN_ERROR, fieldErrors: {} };
    }

    throw error;
  }

  return { error: null, fieldErrors: {} };
}

export async function logout() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/login");
  }

  await signOut({ redirectTo: "/login" });
}
