import { RouterContext } from "koa-router";

import luceedService from "./services/luceed.service";
import luceedProductInventory from "./services/luceedProductInventory.service";
import luceedOrderService from "./services/luceedOrder.service";

class LuceedController {
  async findAllProducts(ctx: RouterContext) {
    const response = await luceedProductInventory.fetchProductsWithInventory();
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
    const luceedProducts =
      await luceedProductInventory.fetchProductsWithInventory();
    const response = await luceedService.syncLuceedShopifyProducts(
      luceedProducts
    );
    ctx.body = response;
    return ctx;
  }
}

export default new LuceedController();
