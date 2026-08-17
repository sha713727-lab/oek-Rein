import { apiRequest } from "@/lib/api/client";

export type BagItem = {
  productId: string;
  quantity: number;
  size?: string | null | undefined;
  color?: string | null | undefined;
  colorHex?: string | null | undefined;
};

export const bagApi = {
  find: async () => {
    const result = await apiRequest<{ items: BagItem[] }>("GET", "/account/bag");
    return result.items;
  },
  upsert: async (items: BagItem[]) => {
    const result = await apiRequest<{ items: BagItem[] }>("PUT", "/account/bag", { items });
    return result.items;
  },
};
