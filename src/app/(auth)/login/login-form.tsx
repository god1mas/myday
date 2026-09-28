"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login, type LoginFormState } from "@/server/actions/auth";

const initialLoginFormState: LoginFormState = {
  error: null,
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Memeriksa…" : "Masuk"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialLoginFormState);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <div>
        <label className="block text-sm font-medium text-slate-800" htmlFor="username">
          Username
        </label>
        <input
          aria-describedby={state.fieldErrors.username ? "username-error" : undefined}
          aria-invalid={state.fieldErrors.username ? true : undefined}
          autoComplete="username"
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
          id="username"
          name="username"
          required
          type="text"
        />
        {state.fieldErrors.username ? (
          <p className="mt-1.5 text-sm text-red-700" id="username-error">
            {state.fieldErrors.username[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800" htmlFor="password">
          Password
        </label>
        <input
          aria-describedby={state.fieldErrors.password ? "password-error" : undefined}
          aria-invalid={state.fieldErrors.password ? true : undefined}
          autoComplete="current-password"
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
          id="password"
          name="password"
          required
          type="password"
        />
        {state.fieldErrors.password ? (
          <p className="mt-1.5 text-sm text-red-700" id="password-error">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p aria-live="polite" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
