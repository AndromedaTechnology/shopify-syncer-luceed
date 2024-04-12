import axios from "axios";

import config from "../../config";
import {
  IShopifyInventoryLevel,
  IShopifySetInventoryLevelResponse,
} from "./shopify.interface";
import { limiter } from "./root.service";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

class ShopifyInventoryService {
  async findAll() {
    /**
     * Item Levels
     * per Location
     */
    // await this.getItemsAndLevelsPerLocation("74681876713");
    // await this.getLevelsPerItemPerLocation("74681876713", "49070355349737");
    // await this.setLevelsPerItemPerLocation("74681876713", "49070355349737", 10);

    return {
      msg: "Hello Shopify Inventory",
    };
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
        console.log(
          "--set-inventory-level-error",
          error,
          locationId,
          inventoryItemId,
          setAmount,

          response?.inventory_level
        );
      }
      throw error;
    }
    if (isDebug) {
      console.log(
        "--set-inventory-level-" + locationId,
        inventoryItemId,
        setAmount,

        response?.inventory_level
      );
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
    console.log("--location-" + locationId, response?.data);
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
    console.log("--location-" + locationId, response?.data);
    return response?.data;
  }
}

export default new ShopifyInventoryService();
