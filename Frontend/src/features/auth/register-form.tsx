"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "@/features/auth/actions";

type State = { error?: string | undefined };

export function RegisterForm() {
  const [state, action] = useActionState(async (_prev: State, formData: FormData) => {
    return registerAction(formData);
  }, {});

  return (
    <div className="auth-form-panel">
      <div className="auth-form-header">
        <span className="auth-form-eyebrow">Join Zermae</span>
        <h2 className="auth-form-title">Create Account</h2>
        <p className="auth-form-subtitle">Save formulas, track orders, and keep your ritual simple</p>
      </div>
      <form className="auth-form" action={action}>
        <label className="auth-field">
          <span className="sr-only">Name</span>
          <input name="name" placeholder="Full Name" autoComplete="name" required className="auth-input" />
        </label>
        <label className="auth-field">
          <span className="sr-only">Email Address</span>
          <input type="email" name="email" placeholder="Email Address" autoComplete="email" required className="auth-input" />
        </label>
        <label className="auth-field">
          <span className="sr-only">Password</span>
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            required
            className="auth-input"
          />
        </label>
        <label className="auth-field">
          <span className="sr-only">Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            autoComplete="new-password"
            required
            className="auth-input"
          />
        </label>
        {state.error ? <p className="auth-form-error">{state.error}</p> : null}
        <button type="submit" className="auth-btn auth-btn-primary luxury-button-solid">
          Create Account
        </button>
      </form>
      <p className="auth-form-meta">
        Already a member?{" "}
        <Link href="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
