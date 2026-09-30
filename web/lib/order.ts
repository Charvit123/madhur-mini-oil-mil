/**
 * Order creation only exists on the real Spring Boot backend — there's no
 * local mock for it under app/api/catalogue/** the way oils/products/facets
 * have, because placing an order means real persistence, real stock
 * reservation, and a real Razorpay order. So this module (deliberately not
 * "server-only", unlike lib/api.ts) calls NEXT_PUBLIC_API_URL directly from
 * the browser in CheckoutClient.tsx. If that env var isn't set, every
 * function here throws a clear, catchable error rather than silently
 * hitting a route that doesn't exist.
 */

export interface LineItemRequest { variantId: string; quantity: number }

export interface CreateOrderRequest {
  items: LineItemRequest[];
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  shipLine1: string;
  shipLine2?: string;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  deliveryMethod: "STANDARD" | "MILL_PICKUP";
  paymentMethod: "UPI" | "CARD" | "NETBANKING" | "COD";
}

export interface RazorpayCheckoutDto {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
}

export interface OrderItemDto {
  variantId: string;
  sku: string;
  productName: string;
  packagingName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  subtotal?: number;
  shippingFee?: number;
  total: number;
  items?: OrderItemDto[];
  placedAt?: string;
  razorpay?: RazorpayCheckoutDto;
  refund?: { refundedAmount: number; razorpayRefundId?: string };
}

export interface OrderPage {
  content: OrderDto[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class OrderApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

function backendBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new OrderApiError(
      "Placing an order needs the real backend. Set NEXT_PUBLIC_API_URL in web/.env.local " +
      "to wherever the Spring Boot service is running (e.g. http://localhost:8080) and restart the dev server."
    );
  }
  return base;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || body.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/** token is optional — order creation is public (guest checkout), but
 *  passing a customer's token links the order to their account server-side. */
export async function createOrder(payload: CreateOrderRequest, token?: string): Promise<OrderDto> {
  const res = await fetch(`${backendBase()}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new OrderApiError(await parseErrorMessage(res), res.status);
  return res.json();
}

export async function listMyOrders(token: string, page = 0): Promise<OrderPage> {
  const res = await fetch(`${backendBase()}/api/orders/mine?page=${page}&size=10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new OrderApiError(await parseErrorMessage(res), res.status);
  return res.json();
}

export async function verifyPayment(orderId: string, payload: VerifyPaymentRequest): Promise<OrderDto> {
  const res = await fetch(`${backendBase()}/api/orders/${orderId}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new OrderApiError(await parseErrorMessage(res), res.status);
  return res.json();
}
