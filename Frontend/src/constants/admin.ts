export const ADMIN_NAV = [
  { id: "overview", label: "Overview", href: "/admin" },
  { id: "inventory", label: "Inventory", href: "/admin/inventory" },
  { id: "orders", label: "Orders", href: "/admin/orders" },
  { id: "storefront", label: "Storefront", href: "/admin/customer-side" },
  { id: "promos", label: "Promos", href: "/admin/promos" },
] as const;

export const ADMIN_QUICK_ACTIONS = [
  { id: "add-product", title: "Add New Product", description: "Create a new listing", href: "/admin/products/new" },
  { id: "inventory", title: "Manage Inventory", description: "Update stock levels", href: "/admin/inventory" },
  { id: "orders", title: "Orders Overview", description: "Review all orders", href: "/admin/orders" },
  { id: "customer-side", title: "Storefront", description: "Colors, homepage PNGs, copy, and checkout fees", href: "/admin/customer-side" },
  { id: "promos", title: "Promo codes", description: "Percentage or fixed discounts", href: "/admin/promos" },
] as const;
