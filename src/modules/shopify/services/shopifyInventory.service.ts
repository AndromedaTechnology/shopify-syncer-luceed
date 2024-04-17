import axios from "axios";

import config from "../../../config";
import {
  IShopifyInventoryLevel,
  IShopifyProduct,
  IShopifySetInventoryLevelResponse,
} from "../interfaces/shopify.interface";
import { limiter } from "../../root/root.service";
import shopifyProductVariantService from "./shopifyProductVariant.service";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

class ShopifyInventoryService {
  /**
   * Set product inventory amount in shopify
   * in defualt passed location
   */
  async setProductInventory(
    product: IShopifyProduct,
    locationDefaultId: number,
    productAmount: number,
    isDebug = true
  ): Promise<IShopifyInventoryLevel | undefined> {
    const productVariant = shopifyProductVariantService.getProductVariant(
      product!
    );
    const productVariantInventoryItemId = productVariant?.inventory_item_id;
    if (isDebug) {
      // console.log(
      //   "--product-variant",
      //   productVariant,
      //   productVariantInventoryItemId
      // );
    }
    if (!productVariantInventoryItemId) {
      throw "productVariantInventoryItemId not found, so can't continue";
    }

    const inventoryLevel = await this.setLevelsPerItemPerLocation(
      locationDefaultId,
      productVariantInventoryItemId,
      productAmount,
      true,
      true
    );
    if (!inventoryLevel) {
      throw "inventory level not set";
    }
    return inventoryLevel;
  }

  /**
   * Get [InventoryItems and Levels]
   * per Location
   */
  async setLevelsPerItemPerLocation(
    locationId: number,
    inventoryItemId: number,
    setAmount: number,
    disconnect_if_necessary = true,
    isDebug = true
  ): Promise<IShopifyInventoryLevel | undefined> {
    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/inventory_levels/set.json?location_id=${locationId}&inventory_item_id=${inventoryItemId}&available=${setAmount}`;
    if (true) {
      url += `&disconnect_if_necessary=${disconnect_if_necessary}`;
    }
    let response: IShopifySetInventoryLevelResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
    } catch (error) {
      console.log(error);
      if (isDebug) {
        // console.log(
        //   "--set-inventory-level-error",
        //   error,
        //   locationId,
        //   inventoryItemId,
        //   setAmount,
        //   response?.inventory_level
        // );
      }
      throw error;
    }
    if (isDebug) {
      // console.log(
      //   "--set-inventory-level-" + locationId,
      //   inventoryItemId,
      //   setAmount,
      //   response?.inventory_level
      // );
    }
    return response?.inventory_level;
  }
  /**
   * Get [InventoryItems and Levels]
   * per Location
   */
  async getLevelsPerItemPerLocation(locationId: string, itemId: string) {
    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/inventory_levels.json?location_ids=${locationId}&inventory_item_ids=${itemId}`;
    let response;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      response = await axios({
        method: "get",
        url: url,
        // data: reqData,

        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
    } catch (error) {
      console.log(error);
    }
    // console.log("--location-" + locationId, response?.data);
    return response?.data;
  }
  /**
   * Get [InventoryItems and Levels]
   * per Location
   */
  async getItemsAndLevelsPerLocation(locationId: string) {
    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/inventory_levels.json?location_ids=${locationId}`;
    let response;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      response = await axios({
        method: "get",
        url: url,
        // data: reqData,

        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
    } catch (error) {
      console.log(error);
    }
    // console.log("--location-" + locationId, response?.data);
    return response?.data;
  }
}

export default new ShopifyInventoryService();
