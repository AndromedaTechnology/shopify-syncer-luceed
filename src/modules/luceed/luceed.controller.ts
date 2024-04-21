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
  async clearJobs() {
    await productSyncQueue.clean(0, "delayed");
    await productSyncQueue.clean(0, "wait");
    await productSyncQueue.clean(0, "active");
    await productSyncQueue.clean(0, "completed");
    await productSyncQueue.clean(0, "failed");

    let multi = productSyncQueue.multi();
    multi.del(productSyncQueue.toKey("repeat"));
    await multi.exec();
  }
  /**
   * SYNC
   */
  async syncLuceedProductsToShopify(ctx: RouterContext) {
    await this.clearJobs();
    let job = await productSyncQueue.add(
      {},
      // Repeat job once every day at 3:15 (am)
      // { repeat: { cron: "15 3 * * *" } }
      // Repeat job every 10 minutes
      { repeat: { cron: "*/10 * * * *" } }
    );
    ctx.body = { id: job.id };
    return ctx;
  }
}

export default new LuceedController();
