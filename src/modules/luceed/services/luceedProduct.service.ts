import axios from "axios";

import config from "../../../config";
import {
  ILuceedProduct,
  ILuceedProductsResponse,
} from "../interfaces/luceedProduct.interface";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Luceed
 */
class LuceedProductService {
  /**
   * TODO: We floor (not to send decimal to Shopify)
   * TODO: Support decimal for meat etc.
   */
  getProductAvailableCnt(product: ILuceedProduct): number {
    const productAmount = product.raspolozivo_kol ?? 0;
    return Math.floor(productAmount);
  }
  /**
   * TODO: Price: 2 or 3 decimal points
   */
  getProductMPC(product: ILuceedProduct): string {
    const price = product.mpc?.toString() ?? "0.00";
    return price;
  }
  getProductCost(product: ILuceedProduct): string {
    const price = product.nc?.toString() ?? "0.00";
    return price;
  }
  removeSKUPrefix(productSku: string): string {
    const productHandleInt = parseInt(productSku);
    productSku = productHandleInt.toString();
    return productSku;
  }
  printProducts(products: Array<ILuceedProduct>) {
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
    // console.log("--luceed-products-" + startPosition, amountToReturn, response);
    return response?.result[0]?.artikli ?? [];
  }
}

export default new LuceedProductService();
