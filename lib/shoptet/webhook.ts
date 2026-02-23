import { upsertProduct } from './products';
import { upsertOrder } from './orders';

export type ShoptetWebhookEvent =
  | 'order:create'
  | 'order:update'
  | 'product:create'
  | 'product:update';

interface WebhookPayload {
  event: string;
  eshopId?: number;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function handleWebhookEvent(payload: WebhookPayload): Promise<{ handled: boolean; message: string }> {
  const event = payload.event as ShoptetWebhookEvent;
  const data = payload.data || payload;

  switch (event) {
    case 'order:create':
    case 'order:update':
      return handleOrderEvent(data);
    case 'product:create':
    case 'product:update':
      return handleProductEvent(data);
    default:
      return { handled: false, message: `Unhandled event: ${event}` };
  }
}

async function handleOrderEvent(data: Record<string, unknown>): Promise<{ handled: boolean; message: string }> {
  const orderData = (data.order || data) as Record<string, unknown>;
  const shoptetId = String(orderData.guid || orderData.code || orderData.id || '');
  if (!shoptetId) {
    return { handled: false, message: 'Missing order ID' };
  }

  const orderDate = orderData.creationTime || orderData.date || orderData.createdAt;
  const orderDateTs = orderDate ? Math.floor(new Date(String(orderDate)).getTime() / 1000) : Math.floor(Date.now() / 1000);

  await upsertOrder({
    shoptet_id: shoptetId,
    order_number: String(orderData.code || orderData.orderNumber || shoptetId),
    status: orderData.status && typeof orderData.status === 'object'
      ? String((orderData.status as Record<string, unknown>).name || '')
      : String(orderData.statusName || orderData.status || ''),
    status_id: orderData.status && typeof orderData.status === 'object'
      ? Number((orderData.status as Record<string, unknown>).id || 0) || null
      : null,
    customer_email: String(orderData.email || (orderData.billingAddress as Record<string, unknown>)?.email || ''),
    customer_name: orderData.billingAddress && typeof orderData.billingAddress === 'object'
      ? String((orderData.billingAddress as Record<string, unknown>).fullName || '')
      : String(orderData.customerName || ''),
    total_price: Number((orderData.price as Record<string, unknown>)?.withVat ?? orderData.totalPrice ?? 0),
    currency: String((orderData.price as Record<string, unknown>)?.currencyCode ?? orderData.currency ?? 'CZK'),
    payment_method: orderData.paymentMethod && typeof orderData.paymentMethod === 'object'
      ? String((orderData.paymentMethod as Record<string, unknown>).name || '')
      : String(orderData.paymentMethodName || '') || null,
    shipping_method: orderData.shipping && typeof orderData.shipping === 'object'
      ? String((orderData.shipping as Record<string, unknown>).name || '')
      : String(orderData.shippingMethodName || '') || null,
    items_count: Array.isArray(orderData.items) ? orderData.items.length : Number(orderData.itemsCount || 0),
    note: orderData.customerRemark ? String(orderData.customerRemark) : null,
    order_date: orderDateTs,
  });

  return { handled: true, message: `Order ${shoptetId} upserted` };
}

async function handleProductEvent(data: Record<string, unknown>): Promise<{ handled: boolean; message: string }> {
  const productData = (data.product || data) as Record<string, unknown>;
  const shoptetId = String(productData.guid || productData.id || '');
  if (!shoptetId) {
    return { handled: false, message: 'Missing product ID' };
  }

  await upsertProduct({
    shoptet_id: shoptetId,
    name: String(productData.name || ''),
    sku: productData.code ? String(productData.code) : null,
    price: Number(productData.price || productData.includingVat || 0),
    price_before_discount: productData.priceBeforeDiscount ? Number(productData.priceBeforeDiscount) : null,
    currency: String(productData.currency || 'CZK'),
    stock: Number((productData.stock as Record<string, unknown>)?.amount ?? productData.amountInStock ?? 0),
    brand: productData.brand ? String(productData.brand) : null,
    category: productData.defaultCategory && typeof productData.defaultCategory === 'object'
      ? String((productData.defaultCategory as Record<string, unknown>).name || '')
      : (productData.category ? String(productData.category) : null),
    image_url: productData.image && typeof productData.image === 'object'
      ? String((productData.image as Record<string, unknown>).src || '')
      : (productData.imageUrl ? String(productData.imageUrl) : null),
    url: productData.url ? String(productData.url) : null,
    visible: productData.visibility === false || productData.visible === 0 ? 0 : 1,
  });

  return { handled: true, message: `Product ${shoptetId} upserted` };
}
