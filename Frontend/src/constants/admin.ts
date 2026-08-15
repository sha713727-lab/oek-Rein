export const ADMIN_QUICK_ACTIONS = [
  { id: "add-product", title: "Add New Product", description: "Create a new listing", href: "/admin/products/new" },
  { id: "analytics", title: "View Analytics", description: "Track performance", href: "/admin/analytics" },
  { id: "inventory", title: "Manage Inventory", description: "Update stock levels", href: "/admin/inventory" },
  { id: "orders", title: "Orders Overview", description: "Review all orders", href: "/admin/orders" },
  { id: "customer-side", title: "Dynamic Customer Side", description: "Manage storefront content", href: "/admin/customer-side" },
] as const;
