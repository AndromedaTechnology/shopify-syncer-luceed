import { RouterContext } from "koa-router";

import luceedService from "./services/luceed.service";
import luceedOrderService from "./services/luceedOrder.service";
import shopifyService from "../shopify/services/shopify.service";

class LuceedController {
  async findAllProducts(ctx: RouterContext) {
    const response = await luceedService.fetchProductsWithInventory();
    ctx.body = response;
    return ctx;
  }
  async findAllOrders(ctx: RouterContext) {
    ctx.body = await luceedOrderService.fetchOrders();
    return ctx;
  }
  /**
   * SYNC
   */
  async syncLuceedProductsToShopify(ctx: RouterContext) {
    const luceedProducts = await luceedService.fetchProductsWithInventory();
    const response = await shopifyService.syncLuceedShopifyProducts(
      luceedProducts
    );
    ctx.body = response;
    return ctx;
  }
}

export default new LuceedController();
