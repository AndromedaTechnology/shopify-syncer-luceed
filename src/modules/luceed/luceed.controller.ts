import { RouterContext } from "koa-router";

import config from "../../config";
import luceedService from "./services/luceed.service";
import luceedOrderService from "./services/luceedOrder.service";
import luceedProductInventory from "./services/luceedProductInventory.service";

import Queue from "bull";
export const productSyncQueue = new Queue("productSync", config.redis_url);

let maxJobsPerWorker = 50;
productSyncQueue.process(maxJobsPerWorker, async (job: any) => {
  console.log("sync process inprores");
  const luceedProducts =
    await luceedProductInventory.fetchProductsWithInventory();
  const response = await luceedService.syncLuceedShopifyProducts(
    luceedProducts
  );
  return Promise.resolve(response);
});

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
    let job = await productSyncQueue.add({});
    ctx.body = { id: job.id };
    return ctx;
  }
}

export default new LuceedController();
