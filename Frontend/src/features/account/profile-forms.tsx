"use client";

import { useActionState } from "react";

import { changePasswordAction, updateProfileAction } from "@/features/account/actions";

type State = { error?: string; ok?: boolean };

export function ProfileForms({ name, email }: { name: string; email: string }) {
  const [profile, profileAction] = useActionState(async (_prev: State, formData: FormData) => {
    return updateProfileAction(formData);
  }, {});
  const [password, passwordAction] = useActionState(async (_prev: State, formData: FormData) => {
    return changePasswordAction(formData);
  }, {});

  return (
    <div className="space-y-10">
      <form action={profileAction} className="checkout-form max-w-md space-y-4">
        <h2 className="text-sm tracking-[0.18em] uppercase">Profile</h2>
        <label className="auth-field">
          <span className="sr-only">Name</span>
          <input name="name" defaultValue={name} required className="auth-input" />
        </label>
        <label className="auth-field">
          <span className="sr-only">Email</span>
          <input name="email" type="email" defaultValue={email} required className="auth-input" />
        </label>
        {profile.error ? <p className="auth-form-error">{profile.error}</p> : null}
        {profile.ok ? <p className="text-sm">Profile updated.</p> : null}
        <button type="submit" className="luxury-button-solid">
          Save profile
        </button>
      </form>
      <form action={passwordAction} className="checkout-form max-w-md space-y-4">
        <h2 className="text-sm tracking-[0.18em] uppercase">Password</h2>
        <label className="auth-field">
          <span className="sr-only">Current password</span>
          <input name="currentPassword" type="password" required placeholder="Current password" className="auth-input" />
        </label>
        <label className="auth-field">
          <span className="sr-only">New password</span>
          <input name="password" type="password" required placeholder="New password" className="auth-input" />
        </label>
        <label className="auth-field">
          <span className="sr-only">Confirm password</span>
          <input name="confirmPassword" type="password" required placeholder="Confirm password" className="auth-input" />
        </label>
        {password.error ? <p className="auth-form-error">{password.error}</p> : null}
        {password.ok ? <p className="text-sm">Password updated.</p> : null}
        <button type="submit" className="luxury-button-solid">
          Change password
        </button>
      </form>
    </div>
  );
}
