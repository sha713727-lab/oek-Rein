"use client";

import { useActionState } from "react";

import { subscribeNewsletterAction } from "@/features/newsletter/actions";

type State = { error?: string | undefined; ok?: boolean | undefined };

export function NewsletterForm() {
  const [state, action] = useActionState(async (_prev: State, formData: FormData) => {
    return subscribeNewsletterAction(formData);
  }, {});

  return (
    <form action={action} className="footer-newsletter-form flex flex-col" noValidate>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="Your email address"
        className="footer-newsletter-input"
        autoComplete="email"
      />
      <button type="submit" className="footer-newsletter-btn">
        Sign up
      </button>
      {state.error ? (
        <p role="alert" className="footer-newsletter-message">
          {state.error}
        </p>
      ) : null}
      {state.ok ? <p className="footer-newsletter-message">You are subscribed. Thank you!</p> : null}
    </form>
  );
}
