import { RateLimiter } from "limiter";

export const limiter = new RateLimiter({
  tokensPerInterval: 2,
  interval: "second",
});

/**
 * RULES
 *
 * 1) product.variants.lenght === 1 (default one)
 * 2) product.handle === product.variant.sku (to easily find products by handle/sku)
 *
 * CEKER-LUCEED-SHOPIFY SYNC PROCEDURE
 *
 * 1) Get Luceed Inventory Status
 * 2) Check for each product: If exists in Shopify: If not - create with default variant. (Product.handle=product.variant.sku)
 * 3) Set Shopify Webshop location: inventory amount for each product
 * 4) Repeat this each (1) HOUR
 *
 * CEKER-SHOPIFY-LUCEED SYNC PROCEDURE - Orders
 *
 * 1) Webhook - OrderCreated - call our method to send new Orders to Luceed (from Shopify)
 * 2) Create Customer (from Shopify Order) if not created in Luceed
 * 3) Webhook - OrderUpdated -
 * 4) Webhook - OrderCancelled -
 */
class RootService {
  async findAll() {
    return {
      msg: "Hello Root",
    };
  }
}

export default new RootService();
