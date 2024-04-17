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
  async findAll() {
    await this.fetchProducts();

    return {
      msg: "Hello Luceed Product",
    };
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
    console.log("--luceed-products-" + startPosition, amountToReturn, response);
    return response?.result[0]?.artikli ?? [];
  }
}

export default new LuceedProductService();
