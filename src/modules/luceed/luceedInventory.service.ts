import axios from "axios";

import config from "../../config";

import {
  ILuceedInventoryItem,
  ILuceedInventoryResponse,
} from "./luceedInventory.interface";
import { ILuceedProduct } from "./luceedProduct.interface";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Luceed
 */
class LuceedInventoryService {
  async findAll() {
    await this.fetchInventory();

    return {
      msg: "Hello Luceed",
    };
  }

  /**
   * TODO: What if multiple items?
   * Filter and check if multiple - if so, throw error.
   * Stop execution further.
   */
  getProductInventory(
    product: ILuceedProduct,
    inventoryItems: Array<ILuceedInventoryItem>
  ): ILuceedInventoryItem | undefined {
    return inventoryItems.find(
      (item) => item.artikl_uid === product.artikl_uid
    );
  }

  /**
   * http://luceedapi.tomsoft.hr:3816/datasnap/rest/artikli/lista/[0,1000]
   */
  async fetchInventory(): Promise<Array<ILuceedInventoryItem>> {
    var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/stanjezalihe/skladiste`;
    let response: ILuceedInventoryResponse | undefined = undefined;
    try {
      const axiosResponse = await axios({
        method: "get",
        url: url,
        // data: reqData,

        auth: {
          username: luceedUsername,
          password: luceedPassword,
        },
        headers: {
          "Content-Type": "application/json",
          // "X-Shopify-Access-Token": accessToken,
        },
      });
      console.log("--luceed-inventory-", axiosResponse);
      response = axiosResponse?.data;
    } catch (error) {
      console.log(error);
    }
    console.log("--luceed-inventory-", response);
    return response?.result[0]?.stanje ?? [];
  }
}

export default new LuceedInventoryService();