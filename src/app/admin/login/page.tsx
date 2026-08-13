"use client";

import { use, useActionState } from "react";
import { sendMagicLink } from "./actions";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = use(searchParams);
  const [state, formAction, pending] = useActionState(sendMagicLink, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-6 py-24">
      <h1 className="text-2xl font-semibold text-accent">Admin sign in</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Enter your email and we&apos;ll send you a sign-in link.
      </p>
      {error === "not_authorized" && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          That account isn&apos;t on the admin list.
        </p>
      )}
      <form action={formAction} className="mt-6 space-y-3">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-md border border-black/20 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send sign-in link"}
        </button>
      </form>
      {state?.message && <p className="mt-4 text-sm text-zinc-600">{state.message}</p>}
    </div>
  );
}
