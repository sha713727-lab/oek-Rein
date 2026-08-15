"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/features/auth/actions";

type State = { error?: string | undefined };

export function LoginForm() {
  const [state, action] = useActionState(async (_prev: State, formData: FormData) => {
    return loginAction(formData);
  }, {});

  return (
    <div className="auth-form-panel">
      <div className="auth-form-header">
        <span className="auth-form-eyebrow">Member Access</span>
        <h2 className="auth-form-title">Welcome Back</h2>
        <p className="auth-form-subtitle">Access your orders, wishlist, and considered skincare</p>
      </div>
      <form className="auth-form" action={action}>
        <label className="auth-field">
          <span className="sr-only">Email Address</span>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            autoComplete="email"
            required
            className="auth-input"
          />
        </label>
        <label className="auth-field">
          <span className="sr-only">Password</span>
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            className="auth-input"
          />
        </label>
        {state.error ? <p className="auth-form-error">{state.error}</p> : null}
        <button type="submit" className="auth-btn auth-btn-primary luxury-button-solid">
          Sign In
        </button>
        <Link href="/collections/all" className="auth-btn auth-btn-ghost">
          Continue as Guest
        </Link>
      </form>
      <p className="auth-form-meta">
        New to Zermae?{" "}
        <Link href="/register" className="auth-link">
          Create an account
        </Link>
      </p>
    </div>
  );
}
