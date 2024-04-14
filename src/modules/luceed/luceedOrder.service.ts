import axios from "axios";

import config from "../../config";
import {
  ILuceedOrder,
  ILuceedCreateOrder,
  ILuceedOrdersResponse,
  ILuceedCreateOrdersResponse,
} from "./luceedOrder.interface";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Luceed
 */
class LuceedOrdersService {
  async findAll() {
    /**
     * TODO: Set default statusi
     */
    await this.fetchOrders();
    return {
      msg: "Hello Luceed Orders",
    };
  }

  private printProducts(orders: Array<ILuceedOrder>) {
    for (const order of orders) {
      console.log({
        broj: order.broj,
        datum: order.datum,
        status: order.status,
        osnovica: order.osnovica,
        pdv: order.pdv,
        jir: order.jir,
        zki: order.zki,
      });
    }
  }

  /**
   * TODO: Set default statusi
   * http://luceedapi.tomsoft.hr:3816/datasnap/rest/artikli/lista/[0,1000]
   *
   * @param statusi Statusi se upisuju u obliku [status1,status2,....]
   */
  async fetchOrders(statusi: string): Promise<Array<ILuceedOrder>> {
    var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/NaloziProdaje/statusi/[${statusi}]`;
    let response: ILuceedOrdersResponse | undefined = undefined;
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
      console.log("--luceed-orders-", axiosResponse);
      response = axiosResponse?.data;
    } catch (error) {
      console.log(error);
    }
    console.log("--luceed-orders-", statusi, response);
    return response?.result[0]?.nalozi_prodaje ?? [];
  }

  /**
   * Nalozi prodaje – kreiranje naloga prodaje u Luceed-u
   *
   * Docs: page 133
   */
  async createOrder(data: ILuceedCreateOrder): Promise<string | undefined> {
    var url = `http://luceedapi.tomsoft.hr:3816/NaloziProdaje/snimi/`;
    let response: ILuceedCreateOrdersResponse | undefined = undefined;
    try {
      const axiosResponse = await axios({
        method: "post",
        url: url,
        data: data,

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
    console.log("--luceed-create-order-", response);
    return response?.result[0] ?? undefined;
  }
}

export default new LuceedOrdersService();
