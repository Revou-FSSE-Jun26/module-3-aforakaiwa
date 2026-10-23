"use client";

// Registration form. Validates all four fields the backend requires
// (email, username, full_name, password), calls useAuth().register() — which
// creates the account and auto-logs-in — then redirects by role.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { destinationForRole } from "@/lib/auth";

interface FieldErrors {
  email?: string;
  username?: string;
  full_name?: string;
  password?: string;
}

// Mirror the backend's constraints so we fail fast before the request.
const USERNAME_MIN = 3;
const PASSWORD_MIN = 6;

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /** Validate every field; returns the error map (empty = valid). */
  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!username.trim()) {
      next.username = "Username is required.";
    } else if (username.trim().length < USERNAME_MIN) {
      next.username = `Username must be at least ${USERNAME_MIN} characters.`;
    }

    if (!fullName.trim()) {
      next.full_name = "Full name is required.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < PASSWORD_MIN) {
      next.password = `Password must be at least ${PASSWORD_MIN} characters.`;
    }

    return next;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const result = await register({
        email: email.trim(),
        username: username.trim(),
        full_name: fullName.trim(),
        password,
      });
      if (result.ok) {
        toast.success(`Welcome, ${result.user.username}!`);
        router.replace(destinationForRole(result.user.role));
      } else {
        setFormError(result.message);
        toast.error(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const baseField =
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/40";
  const fieldClass = (hasError: boolean) =>
    `${baseField} ${
      hasError
        ? "border-red-400 focus:border-red-500"
        : "border-gray-300 focus:border-brand"
    }`;
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";
  const errorText = (msg?: string) =>
    msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      noValidate
    >
      <div>
        <h1 className="text-xl font-bold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Join RevoShop to start shopping.
        </p>
      </div>

      <div>
        <label htmlFor="reg-fullname" className={labelClass}>
          Full name
        </label>
        <input
          id="reg-fullname"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={fieldClass(!!fieldErrors.full_name)}
          placeholder="Jane Doe"
        />
        {errorText(fieldErrors.full_name)}
      </div>

      <div>
        <label htmlFor="reg-username" className={labelClass}>
          Username
        </label>
        <input
          id="reg-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={fieldClass(!!fieldErrors.username)}
          placeholder="janedoe"
        />
        {errorText(fieldErrors.username)}
      </div>

      <div>
        <label htmlFor="reg-email" className={labelClass}>
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass(!!fieldErrors.email)}
          placeholder="you@example.com"
        />
        {errorText(fieldErrors.email)}
      </div>

      <div>
        <label htmlFor="reg-password" className={labelClass}>
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass(!!fieldErrors.password)}
          placeholder="At least 6 characters"
        />
        {errorText(fieldErrors.password)}
      </div>

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span aria-hidden>⚠</span>
          <span>{formError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden
          />
        )}
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
