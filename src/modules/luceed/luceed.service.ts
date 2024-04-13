import axios from "axios";

import config from "../../config";
import {
  ILuceedProduct,
  ILuceedInventoryItem,
  ILuceedProductsResponse,
  ILuceedInventoryResponse,
} from "./luceed.interface";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Luceed
 */
class LuceedService {
  async findAll() {
    await this.fetchProductsWithInventory();

    return {
      msg: "Hello Luceed",
    };
  }

  async fetchProductsWithInventory(
    isDebug = true
  ): Promise<Array<ILuceedProduct>> {
    /**
     * Fetch Products
     */
    let products: Array<ILuceedProduct> = [];
    try {
      products = await this.fetchProducts();
      if (isDebug) {
        this.printProducts(products);
      }
    } catch (error) {
      throw error;
    }

    /**
     * Fetch Inventory
     */

    let inventoryItems: Array<ILuceedInventoryItem> = [];
    try {
      inventoryItems = await this.fetchInventory();
    } catch (error) {
      throw error;
    }
    if (isDebug) {
      console.log(inventoryItems);
    }

    /**
     * Merge products and inventory
     */
    const merged: Array<ILuceedProduct> = this.mergeProductsWithInventory(
      products,
      inventoryItems
    );
    if (isDebug) {
      this.printProducts(merged);
      console.log("LUCEED Products TOTAL", merged?.length);
    }

    return merged;
  }

  private printProducts(products: Array<ILuceedProduct>) {
    for (const artikl of products) {
      console.log({
        uid: artikl.artikl_uid,
        sku: artikl.artikl,
        glavni_dobavljac_uid: artikl.glavni_dobavljac_uid,
        glavni_dobavljac_naziv: artikl.glavni_dobavljac_naziv,
        naziv: artikl.naziv,
        mpc: artikl.mpc,
        vpc: artikl.vpc,
        nc: artikl.nc,
        stanje_kol: artikl.stanje_kol,
        raspolozivo_kol: artikl.raspolozivo_kol,
      });
    }
  }

  private mergeProductsWithInventory(
    products: Array<ILuceedProduct>,
    inventoryItems: Array<ILuceedInventoryItem>
  ): Array<ILuceedProduct> {
    products = products.map((product) => {
      const productInventoryItem = this.getProductInventory(
        product,
        inventoryItems
      );
      return {
        ...product,
        raspolozivo: productInventoryItem?.raspolozivo,
        raspolozivo_kol: productInventoryItem?.raspolozivo_kol,
        stanje: productInventoryItem?.stanje,
        stanje_kol: productInventoryItem?.stanje_kol,
      };
    });
    return products;
  }

  /**
   * TODO: What if multiple items?
   * Filter and check if multiple - if so, throw error.
   * Stop execution further.
   */
  private getProductInventory(
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

  /**
   * http://luceedapi.tomsoft.hr:3816/datasnap/rest/artikli/lista/[0,1000]
   * @param {string} productIds comma separated stirng list
   */
  async fetchProducts(
    startPosition = 0,
    amountToReturn = 1000
  ): Promise<Array<ILuceedProduct>> {
    var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/artikli/lista/[${startPosition},${amountToReturn}]`;
    let response: ILuceedProductsResponse | undefined = undefined;
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
        },
      });
      response = axiosResponse?.data;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
    console.log("--luceed-products-" + startPosition, amountToReturn, response);
    return response?.result[0]?.artikli ?? [];
  }
}

export default new LuceedService();
