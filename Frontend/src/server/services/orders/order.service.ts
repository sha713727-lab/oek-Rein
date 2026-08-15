import { PRODUCT_STATUS } from "@/constants/catalog";
import { calculateShippingFee, calculateTaxAmount } from "@/constants/commerce";
import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS, type OrderStatus } from "@/constants/order-status";
import { ADMIN_ROLES, type Role } from "@/constants/roles";
import { AppError } from "@/lib/app-error";
import { sha256Hex } from "@/lib/crypto";
import { withTransaction } from "@/server/database/query";
import { idempotencyRepository } from "@/server/database/repositories/idempotency/idempotency.repository";
import { orderRepository } from "@/server/database/repositories/order/order.repository";
import { productService } from "@/server/services/products/product.service";
import { storefrontService } from "@/server/services/storefront/storefront.service";
import type { OrderItemRecord, OrderRecord } from "@/types/order";

function generateOrderNumber(): string {
  return `MH${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

export class OrderService {
  async getCommerceSettings() {
    return storefrontService.getPublished();
  }

  async checkout(
    payload: {
      email: string;
      phone: string;
      fullName: string;
      address: string;
      city: string;
      postalCode: string;
      paymentMethod: string;
      items: Array<{
        productId: string;
        quantity: number;
        size?: string | null | undefined;
        color?: string | null | undefined;
        colorHex?: string | null | undefined;
      }>;
      notes?: string | null | undefined;
    },
    userId: string | null,
    idempotencyKey: string,
  ): Promise<OrderRecord> {
    const requestHash = sha256Hex(JSON.stringify(payload));
    const existing = await idempotencyRepository.find(idempotencyKey);
    if (existing) {
      if (existing.request_hash !== requestHash) {
        throw AppError.conflict("Idempotency key reused with a different payload");
      }
      return existing.response_body as OrderRecord;
    }

    const order = await withTransaction(async (client) => {
      const products = await productService.getByIds(
        payload.items.map((item) => item.productId),
        client,
      );
      const productMap = new Map(products.map((product) => [product.id, product]));
      const orderItems: OrderItemRecord[] = [];
      let subtotal = 0;

      for (const item of payload.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw AppError.notFound(`Product not found: ${item.productId}`);
        }
        if (product.status !== PRODUCT_STATUS.PUBLISHED) {
          throw AppError.validation([{ field: "items", message: `${product.title} is not available` }]);
        }
        if (product.stock < item.quantity) {
          throw AppError.validation([{ field: "items", message: `Insufficient stock for ${product.title}` }]);
        }
        const unitPrice = product.effectivePrice;
        subtotal += unitPrice * item.quantity;
        orderItems.push({
          productId: product.id,
          name: product.title,
          sku: product.sku,
          quantity: item.quantity,
          size: item.size ?? null,
          color: item.color ?? null,
          colorHex: item.colorHex ?? null,
          price: unitPrice,
          imageUrl: product.images[0]?.url ?? null,
        });
      }

      const commerce = await storefrontService.getPublished();
      const shippingFee = calculateShippingFee(subtotal, commerce);
      const taxAmount = calculateTaxAmount(subtotal, commerce);

      for (const item of payload.items) {
        await productService.reserveStock(item.productId, item.quantity, client);
      }

      return orderRepository.insert(
        {
          orderNumber: generateOrderNumber(),
          accountId: userId,
          customer: payload.fullName.trim(),
          email: payload.email.toLowerCase().trim(),
          phone: payload.phone.trim(),
          address: payload.address.trim(),
          city: payload.city.trim(),
          postalCode: payload.postalCode.trim(),
          paymentMethod: payload.paymentMethod,
          status: ORDER_STATUS.PENDING,
          items: orderItems,
          subtotal,
          shippingFee,
          taxAmount,
          taxRate: commerce.taxEnabled ? commerce.taxRate : 0,
          taxLabel: commerce.taxLabel,
          total: subtotal + shippingFee + taxAmount,
          notes: payload.notes ?? null,
        },
        client,
      );
    });

    await idempotencyRepository.insert({
      keyValue: idempotencyKey,
      requestHash,
      responseBody: order,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return order;
  }

  async listMine(userId: string, page = 1, limit = 20, cursor?: string) {
    return orderRepository.findPage({ page, limit, cursor, accountId: userId });
  }

  async listAdmin(page = 1, limit = 20, status?: string, cursor?: string) {
    return orderRepository.findPage({
      page,
      limit,
      cursor,
      status: status && status !== "all" ? status : undefined,
    });
  }

  async getByOrderNumber(orderNumber: string, user: { id: string; role: Role } | null) {
    const isAdmin = Boolean(user && ADMIN_ROLES.includes(user.role));
    const order = await orderRepository.findByOrderNumber(orderNumber, isAdmin ? undefined : user?.id);
    if (!order) {
      throw AppError.notFound("Order not found");
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw AppError.notFound("Order not found");
    }
    const current = order.status as OrderStatus;
    if (!ORDER_STATUS_TRANSITIONS[current].includes(status)) {
      throw AppError.validation([{ field: "status", message: "Invalid status transition" }]);
    }
    return orderRepository.updateStatus(
      id,
      status,
      order.version,
      status === ORDER_STATUS.CANCELLED ? new Date() : null,
    );
  }
}

export const orderService = new OrderService();
