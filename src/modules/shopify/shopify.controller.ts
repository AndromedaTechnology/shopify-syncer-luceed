import { RouterContext } from "koa-router";

import shopifyService from "./services/shopify.service";
import shopifyOrdersService from "./services/shopifyOrders.service";
import shopifyProductService from "./services/shopifyProduct.service";
import luceedOrderService from "../luceed/services/luceedOrder.service";
import luceedProductService from "../luceed/services/luceedProduct.service";

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
    const shopifyOrders = await shopifyOrdersService.fetchOrders(
      undefined,
      false
    );
    const luceedOrders = await luceedOrderService.fetchOrders();
    const luceedProducts = await luceedProductService.fetchProducts();
    const response = await shopifyService.syncShopifyOrdersToLuceed(
      shopifyOrders,
      luceedOrders,
      luceedProducts
    );
    ctx.body = response;
    return ctx;
  }
}

export default new ShopifyController();
