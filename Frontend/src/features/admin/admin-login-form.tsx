"use client";

import { useActionState, useState } from "react";

import { AdminPasscodeModal } from "@/features/admin/admin-passcode-modal";
import { adminLoginAction, adminVerifyAction } from "@/features/admin/actions";

type LoginState = {
  error?: string | undefined;
  challengeId?: string | undefined;
};

export function AdminLoginForm() {
  const [challengeId, setChallengeId] = useState<string | undefined>();
  const [loginState, loginFormAction] = useActionState(async (_prev: LoginState, formData: FormData) => {
    const result = await adminLoginAction(formData);
    if (result.challengeId) {
      setChallengeId(result.challengeId);
    }
    return result;
  }, {});
  const [verifyState, verifyFormAction] = useActionState(async (_prev: { error?: string }, formData: FormData) => {
    return adminVerifyAction(formData);
  }, {});

  function closePasscodeModal() {
    setChallengeId(undefined);
  }

  return (
    <>
      <div className="auth-form-panel">
        <div className="auth-form-header">
          <span className="auth-form-eyebrow">Admin Access</span>
          <h2 className="auth-form-title">Sign in</h2>
          <p className="auth-form-subtitle">Sign in to manage formulas, orders, and storefront content</p>
        </div>
        <form className="auth-form" action={loginFormAction}>
          <label className="auth-field">
            <span className="sr-only">Email</span>
            <input type="email" name="email" required className="auth-input" placeholder="Email Address" />
          </label>
          <label className="auth-field">
            <span className="sr-only">Password</span>
            <input type="password" name="password" required className="auth-input" placeholder="Password" />
          </label>
          {loginState.error ? <p className="auth-form-error">{loginState.error}</p> : null}
          <button type="submit" className="auth-btn auth-btn-primary luxury-button-solid">
            Continue
          </button>
        </form>
      </div>

      <AdminPasscodeModal
        open={Boolean(challengeId)}
        challengeId={challengeId ?? ""}
        error={verifyState.error}
        onClose={closePasscodeModal}
        onSubmit={verifyFormAction}
      />
    </>
  );
}
