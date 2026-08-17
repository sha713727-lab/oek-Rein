"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPasswordAction } from "@/features/auth/actions";

type State = { error?: string | undefined };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(async (_prev: State, formData: FormData) => {
    return resetPasswordAction(formData);
  }, {});

  if (!token) {
    return (
      <div className="auth-form-panel">
        <div className="auth-form-header">
          <span className="auth-form-eyebrow">Member Access</span>
          <h2 className="auth-form-title">Link Missing</h2>
          <p className="auth-form-subtitle">This reset page needs a valid link from your email.</p>
        </div>
        <Link href="/forgot-password" className="auth-btn auth-btn-primary luxury-button-solid">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form-panel">
      <div className="auth-form-header">
        <span className="auth-form-eyebrow">Member Access</span>
        <h2 className="auth-form-title">New Password</h2>
        <p className="auth-form-subtitle">Choose a password of at least 8 characters.</p>
      </div>
      <form className="auth-form" action={action}>
        <input type="hidden" name="token" value={token} />
        <label className="auth-field">
          <span className="sr-only">New password</span>
          <input type="password" name="password" placeholder="New password" autoComplete="new-password" required minLength={8} className="auth-input" />
        </label>
        <label className="auth-field">
          <span className="sr-only">Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            autoComplete="new-password"
            required
            minLength={8}
            className="auth-input"
          />
        </label>
        {state.error ? <p className="auth-form-error">{state.error}</p> : null}
        <button type="submit" className="auth-btn auth-btn-primary luxury-button-solid">
          Update password
        </button>
      </form>
    </div>
  );
}
