console.log("Hello, Heroku Scheduler!");

import { productSyncQueue } from "../modules/luceed/luceed.controller";

// if (process.env.NODE_ENV !== "test") {
// }

async function syncLuceedProductsToShopify() {
  console.log("Schelduer: Sync: inside call begin");
  let job = await productSyncQueue.add({});
  console.log("Schelduer: Sync: inside call end", job.id);
}

console.log("Schelduer: Sync: before call");
syncLuceedProductsToShopify();
console.log("Schelduer: Sync: after call");
