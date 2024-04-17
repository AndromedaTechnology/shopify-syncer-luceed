import { RouterContext } from "koa-router";

import shopifyService from "./services/shopify.service";
import luceedService from "../luceed/services/luceed.service";
import shopifyOrdersService from "./services/shopifyOrders.service";
import shopifyProductService from "./services/shopifyProduct.service";

class ShopifyController {
  /**
   * Find Products
   */
  async findAllProducts(ctx: RouterContext) {
    const items = await shopifyProductService.fetchProducts();
    ctx.body = items;
    return ctx;
  }

  /**
   * Find Orders
   */
  async findAllOrders(ctx: RouterContext) {
    const items = await shopifyOrdersService.fetchOrders(undefined, false);
    shopifyOrdersService.printOrders(items);
    ctx.body = items;
    return ctx;
  }

  async syncShopifyOrdersToLuceed(ctx: RouterContext) {
    const response = null;
    ctx.body = response;
    return ctx;
  }
}

export default new ShopifyController();
