import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { cartCookieName } from "@/constants/cookies";
import { getEnv } from "@/lib/env";
import { cartStateSchema } from "@/schemas/order";

export type CartItem = {
  productId: string;
  quantity: number;
  size?: string | null | undefined;
  color?: string | null | undefined;
  colorHex?: string | null | undefined;
};

export type CartState = { items: CartItem[] };

function sign(value: string): string {
  return createHmac("sha256", getEnv().SESSION_SECRET).update(value).digest("hex");
}

function encode(state: CartState): string {
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(value: string | undefined): CartState {
  if (!value) {
    return { items: [] };
  }
  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return { items: [] };
  }
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return { items: [] };
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as unknown;
    return cartStateSchema.parse(parsed);
  } catch {
    return { items: [] };
  }
}

export async function readCart(): Promise<CartState> {
  const store = await cookies();
  return decode(store.get(cartCookieName)?.value);
}

export async function writeCart(state: CartState): Promise<void> {
  const store = await cookies();
  store.set(cartCookieName, encode(state), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
