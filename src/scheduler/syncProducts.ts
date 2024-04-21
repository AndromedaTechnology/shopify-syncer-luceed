console.log("Hello, Heroku Scheduler!");

import app from "../app";
import server from "../server";
import { databaseSetup } from "../database";
import luceedProductInventoryService from "../modules/luceed/services/luceedProductInventory.service";
import luceedService from "../modules/luceed/services/luceed.service";

// if (process.env.NODE_ENV !== "test") {
// }

async function syncLuceedProductsToShopify() {
  await databaseSetup();
  console.log("Schelduer: Sync: inside call begin");
  const luceedProducts =
    await luceedProductInventoryService.fetchProductsWithInventory();
  const response = await luceedService.syncLuceedShopifyProducts(
    luceedProducts
  );
  console.log("Schelduer: Sync: inside call end", response);
  return response;
}

console.log("Schelduer: Sync: before call");
syncLuceedProductsToShopify();
console.log("Schelduer: Sync: after call");

export { app, server };
