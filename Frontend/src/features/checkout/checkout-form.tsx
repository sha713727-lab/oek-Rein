"use client";

import { useActionState } from "react";

import { checkoutAction } from "@/features/checkout/actions";

type State = { error?: string | undefined };

export function CheckoutForm({
  itemsJson,
  defaultName,
  defaultEmail,
}: {
  itemsJson: string;
  defaultName?: string | undefined;
  defaultEmail?: string | undefined;
}) {
  const [state, action] = useActionState(async (_prev: State, formData: FormData) => {
    return checkoutAction(formData);
  }, {});

  return (
    <form id="checkout-form" action={action} className="checkout-form space-y-4">
      <input type="hidden" name="items" value={itemsJson} />
      <label className="auth-field">
        <span className="sr-only">Full name</span>
        <input name="fullName" defaultValue={defaultName} required placeholder="Full name" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Email</span>
        <input name="email" type="email" defaultValue={defaultEmail} required placeholder="Email" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Phone</span>
        <input name="phone" required placeholder="Phone" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Address</span>
        <input name="address" required placeholder="Address" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">City</span>
        <input name="city" required placeholder="City" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Postal code</span>
        <input name="postalCode" required placeholder="Postal code" className="auth-input" />
      </label>
      <input type="hidden" name="paymentMethod" value="cod" />
      {state.error ? <p className="auth-form-error">{state.error}</p> : null}
      <button type="submit" className="luxury-button-solid">
        Place order
      </button>
    </form>
  );
}
