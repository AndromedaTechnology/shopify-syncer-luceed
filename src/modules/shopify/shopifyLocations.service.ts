import axios from "axios";

import config from "../../config";
import {
  IShopifyLocation,
  IShopifyLocationResponse,
  IShopifyLocationsResponse,
} from "./shopify.interface";
import { limiter } from "../root/root.service";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

class ShopifyLocationsService {
  async findAll() {
    /**
     * Locations
     */
    await this.getLocations();
    // await this.getLocation("74681876713");
    // await this.getLocation("74681811177");
    // await this.getLocation("74681909481");

    return {
      msg: "Hello Shopify Locations",
    };
  }

  async getLocation(id: string): Promise<IShopifyLocation | undefined> {
    var url = `https://${shopName}.myshopify.com/admin/api/2024-04/locations/${id}.json`;
    let response: IShopifyLocationResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
    } catch (error) {
      console.log(error);
    }
    console.log("--location-" + id, response?.location);
    return response?.location;
  }
  /**
   * TODO: Paginate
   */
  async getLocations(): Promise<Array<IShopifyLocation>> {
    var url = `https://${shopName}.myshopify.com/admin/api/2024-04/locations.json`;
    let response: IShopifyLocationsResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
    } catch (error) {
      console.log(error);
    }
    console.log("--locations", response?.locations);
    return response?.locations ?? [];
  }
}

export default new ShopifyLocationsService();
