import axios from "axios";

import config from "../../../config";
import {
  IShopifyInventoryItem,
  IShopifyInventoryLevel,
  IShopifyProduct,
  IShopifySetInventoryLevelResponse,
  IShopifyUpdateInventoryItem,
} from "../interfaces/shopify.interface";
import { limiter } from "../../root/root.service";
import shopifyProductVariantService from "./shopifyProductVariant.service";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";
import statusService from "../../status/status.service";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

/**
 * https://shopify.dev/docs/api/admin-rest/2024-01/resources/inventorylevel
 */
class ShopifyInventoryService {
  /**
   * Set product inventory amount in shopify
   * in defualt passed location
   */
  async setProductInventory(
    product: IShopifyProduct,
    locationWebshopId: number,
    locationShopId: number,
    productAmount: number,
    productCost: string,
    is_buyable_only_in_physical_shop = false,
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
      const error_message =
        "productVariantInventoryItemId not found, so can't continue";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }

    const inventoryItem = await this.setInventoryItemCost(
      productVariantInventoryItemId!,
      productCost,
      isDebug
    );

    /**
     * Set to diff location - based on Database flags
     *
     * Set to passed location to passed amount.
     * And the other location - to 0.
     *
     * In the future we can delete other location.
     */
    let inventoryLevel;
    if (is_buyable_only_in_physical_shop) {
      inventoryLevel = await this.setLevelsPerItemPerLocation(
        locationWebshopId,
        productVariantInventoryItemId!,
        0,
        true,
        true
      );
      inventoryLevel = await this.setLevelsPerItemPerLocation(
        locationShopId,
        productVariantInventoryItemId!,
        productAmount,
        true,
        true
      );
    } else {
      inventoryLevel = await this.setLevelsPerItemPerLocation(
        locationWebshopId,
        productVariantInventoryItemId!,
        productAmount,
        true,
        true
      );
      /**
       * Set inventory for physical shop also.
       * Shopify allows only single shipping method - delivery or pick-up - per order.
       * So, make it available both in Physical shop and Webshop,
       * and let users pick how shipping will be handled.
       */
      inventoryLevel = await this.setLevelsPerItemPerLocation(
        locationShopId,
        productVariantInventoryItemId!,
        productAmount,
        true,
        true
      );
    }
    if (!inventoryLevel) {
      const error_message = "inventory level not set";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }
    return inventoryLevel;
  }

  /**
   * Set Inventory Item cost (nabavna cijena)
   */
  async setInventoryItemCost(
    inventoryItemId: number,
    setCost: string,
    isDebug = true
  ): Promise<IShopifyInventoryItem | undefined> {
    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/inventory_items/${inventoryItemId}.json`;
    let response: { inventory_item?: IShopifyInventoryItem } | undefined =
      undefined;
    const data: IShopifyUpdateInventoryItem = {
      inventory_item: {
        id: inventoryItemId,
        cost: setCost,
      },
    };
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        // proxy: AxiosProxyHelper.getProxy(),
        method: "put",
        url: url,
        data: data,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
    } catch (error) {
      console.log(error);
      if (isDebug) {
        //
      }
      throw error;
    }
    if (isDebug) {
      //
    }
    return response?.inventory_item;
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
        // proxy: AxiosProxyHelper.getProxy(),
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
        // proxy: AxiosProxyHelper.getProxy(),
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
        // proxy: AxiosProxyHelper.getProxy(),
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
