console.log("NewHello, Heroku Scheduler!");

import luceedService from "../modules/luceed/services/luceed.service";
import luceedProductInventoryService from "../modules/luceed/services/luceedProductInventory.service";

// if (process.env.NODE_ENV !== "test") {
// }

async function syncLuceedProductsToShopify() {
  console.log("NewSchelduer: Sync: inside call begin");
  console.log("Newsync process inprores");
  const luceedProducts =
    await luceedProductInventoryService.fetchProductsWithInventory();
  const response = await luceedService.syncLuceedShopifyProducts(
    luceedProducts
  );
  console.log("NewSchelduer: Sync: inside call end", response);
}

console.log("NewSchelduer: Sync: before call");
syncLuceedProductsToShopify();
console.log("NewSchelduer: Sync: after call");
