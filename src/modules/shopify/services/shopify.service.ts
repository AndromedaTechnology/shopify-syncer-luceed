import config from "../../../config";

import {
  IShopifyOrder,
  IShopifyProduct,
} from "../interfaces/shopify.interface";
import shopifyProductService from "./shopifyProduct.service";
import shopifyLocationsService from "./shopifyLocations.service";
import shopifyInventoryService from "./shopifyInventory.service";
import { ILuceedProduct } from "../../luceed/interfaces/luceedProduct.interface";

class ShopifyService {
  async syncShopifyOrdersToLuceed(shopifyOrders: Array<IShopifyOrder>) {
    //
  }
}

export default new ShopifyService();
