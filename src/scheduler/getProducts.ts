console.log("NewHello, GetProducts, Heroku Scheduler!");

import shopifyProductService from "../modules/shopify/services/shopifyProduct.service";

// if (process.env.NODE_ENV !== "test") {
// }

async function syncLuceedProductsToShopify() {
  console.log("NewSchelduer: GetProducts: Sync: inside call begin");
  console.log("Newsync: GetProducts: process inprores");
  const response = await shopifyProductService.fetchProducts();
  console.log("NewSchelduer: GetProducts: Sync: inside call end", response);
}

console.log("NewSchelduer: GetProducts: Sync: before call");
syncLuceedProductsToShopify();
console.log("NewSchelduer: GetProducts: Sync: after call");
