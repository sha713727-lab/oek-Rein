"use client";

import { useActionState, useState } from "react";

import { adminLoginAction, adminVerifyAction } from "@/features/admin/actions";

type LoginState = {
  error?: string | undefined;
  challengeId?: string | undefined;
  developmentOtp?: string | undefined;
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

  if (challengeId) {
    return (
      <div className="auth-form-panel">
        <div className="auth-form-header">
          <span className="auth-form-eyebrow">Admin Access</span>
          <h2 className="auth-form-title">Verify Code</h2>
          <p className="auth-form-subtitle">Enter the verification code sent to your email</p>
        </div>
        <form className="auth-form" action={verifyFormAction}>
          <input type="hidden" name="challengeId" value={challengeId} />
          <label className="auth-field">
            <span className="sr-only">Verification code</span>
            <input
              name="otp"
              inputMode="numeric"
              required
              defaultValue={loginState.developmentOtp}
              className="auth-input"
              placeholder="Verification code"
            />
          </label>
          {loginState.developmentOtp ? (
            <p className="text-xs text-text-sub">Development verification code is prefilled because SMTP is not used in this environment.</p>
          ) : null}
          {verifyState.error ? <p className="auth-form-error">{verifyState.error}</p> : null}
          <button type="submit" className="auth-btn auth-btn-primary luxury-button-solid">
            Verify
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-form-panel">
      <div className="auth-form-header">
        <span className="auth-form-eyebrow">Admin Access</span>
        <h2 className="auth-form-title">Zermae Console</h2>
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
  );
}
