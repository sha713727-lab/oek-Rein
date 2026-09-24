"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { checkoutAction } from "@/features/checkout/actions";

type AddressOption = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  is_default: boolean;
};

type State = { error?: string | undefined };

function PlaceOrderButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="luxury-button-solid" disabled={pending} aria-disabled={pending}>
      {pending ? "Placing order..." : "Place order"}
    </button>
  );
}

export function CheckoutForm({
  defaultName,
  defaultEmail,
  addresses = [],
}: {
  defaultName?: string | undefined;
  defaultEmail?: string | undefined;
  addresses?: AddressOption[];
}) {
  const [state, action] = useActionState(async (_prev: State, formData: FormData) => {
    return checkoutAction(formData);
  }, {});
  const selected = addresses.find((item) => item.is_default) ?? addresses[0];

  return (
    <form id="checkout-form" action={action} className="checkout-form space-y-4">
      {addresses.length > 0 ? (
        <label className="auth-field">
          <span className="sr-only">Saved address</span>
          <select
            name="savedAddress"
            defaultValue={selected?.id ?? ""}
            className="auth-input"
            onChange={(event) => {
              const next = addresses.find((item) => item.id === event.target.value);
              const form = event.currentTarget.form;
              if (!next || !form) {
                return;
              }
              const fields = ["fullName", "phone", "address", "city", "postalCode"] as const;
              const values = [next.full_name, next.phone, next.address, next.city, next.postal_code];
              fields.forEach((name, index) => {
                const field = form.elements.namedItem(name);
                if (field instanceof HTMLInputElement) {
                  field.value = values[index] ?? "";
                }
              });
            }}
          >
            {addresses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {item.is_default ? " (default)" : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="auth-field">
        <span className="sr-only">Full name</span>
        <input name="fullName" defaultValue={selected?.full_name ?? defaultName} required placeholder="Full name" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Email</span>
        <input name="email" type="email" defaultValue={defaultEmail} required placeholder="Email" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Phone</span>
        <input name="phone" defaultValue={selected?.phone ?? ""} required placeholder="Phone" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Address</span>
        <input name="address" defaultValue={selected?.address ?? ""} required placeholder="Address" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">City</span>
        <input name="city" defaultValue={selected?.city ?? ""} required placeholder="City" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Postal code</span>
        <input name="postalCode" defaultValue={selected?.postal_code ?? ""} required placeholder="Postal code" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="sr-only">Promo code</span>
        <input name="promoCode" placeholder="Promo code (optional)" className="auth-input" />
      </label>
      <input type="hidden" name="paymentMethod" value="cod" />
      <p className="checkout-note">Cash on delivery only. You will pay when the order is delivered. Card checkout is not offered.</p>
      {state.error ? <p className="auth-form-error">{state.error}</p> : null}
      <PlaceOrderButton />
    </form>
  );
}
