import axios from "axios";

import config from "../../../config";
import {
  ILuceedOrder,
  ILuceedCreateOrder,
  ILuceedOrdersResponse,
  ILuceedCreateOrdersResponse,
  ILuceedCreateOrderProduct,
  ILuceedCreateOrderPayment,
  ILuceedCreateOrdersRequest,
} from "../interfaces/luceedOrder.interface";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Statusi
 *
 * Page 97 of docs.
 * Check if this is complete and true list.
 *
 * Used to query NaloziProdaje, by statusi.
 */
export const LuceedStatusi = [
  "Novi",
  "Prikupljen",
  "U dostavi",
  "Nije isporučeno - ne želi primiti",
  "Nije isporučeno - nema novaca",
  "Nije isporučeno - nema nikoga kod kuće",
  "Isporučeno",
  "Primljeno na skladište",
  "Storno",
  "Utovareno na vozilo",
];

/**
 * Luceed
 */
class LuceedOrdersService {
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
   * Fetch Order
   *
   * @param statusi Statusi se upisuju u obliku [status1,status2,....]
   * @param statusi Set default statusi
   * @param statusi TODO: Check if statusi properly set. (via param constructor)
   */
  async fetchOrders(
    // orderUid?: string,
    // statusi: string = LuceedStatusi.toString()
    statusi: string = "01,02"
  ): Promise<Array<ILuceedOrder>> {
    var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/NaloziProdaje/statusi/[${statusi}]`;
    // var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/NaloziProdaje/uid/[${orderUid}]`;
    let response: ILuceedOrdersResponse | undefined = undefined;
    try {
      const axiosResponse = await axios({
        method: "get",
        url: url,
        auth: {
          username: luceedUsername,
          password: luceedPassword,
        },
        headers: {
          "Content-Type": "application/json",
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
   * Docs: page 133
   *
   * Note about UID(s): UID= ID-SID.
   *
   * @param {string} orderDate    * DATE type
   * @param {string} orderDate    * TODO: Convert to date before calling CreateOrder() and passing param.
   */
  async createOrder(
    orderDate: string,
    narudzba: string,
    luceedPartnerUid: string,
    /**
     * Stavke
     */
    stavke: Array<ILuceedCreateOrderProduct> = [],
    /**
     * Pouzece
     * "vrsta_placanja_uid": "12-3228",
     * "naziv": "Pouzeće",
     * "fiskalna_oznaka": "T"
     */
    placanjeIznos: string,
    orderData: ILuceedCreateOrder = {}
  ): Promise<string | undefined> {
    var url = `http://luceedapi.tomsoft.hr:3816/NaloziProdaje/snimi/`;
    let response: ILuceedCreateOrdersResponse | undefined = undefined;

    /**
     * Placanje
     */
    const placanje: ILuceedCreateOrderPayment = {
      iznos: placanjeIznos,
      vrsta_placanja_uid:
        config.luceed_nalog_prodaje_vrsta_placanja_pouzece_uid,
    };

    orderData = {
      ...(orderData ?? {}),
      datum: orderDate ?? new Date().toDateString(),
      nalog_prodaje_b2b: narudzba ?? "Shopify Order Test",
      narudzba: narudzba ?? "Shopify Order Test",
      /**
       * Partner / customer
       */
      partner_uid: luceedPartnerUid,
      /**
       * Skladiste
       * Add skladiste props
       * - `sa_skladista` - maloprodaja skladiste sifra
       * - `skl_dokument=MSM` - medjuskladisnica maloprodaje - automatski prebacuje robu iz maloprodaje na webshop
       * - `na_skladiste` - webshop skladiste sifra
       *
       * This will make sure products are transfered between warehouses, on 'fiscal bill' creation.
       */
      sa__skladiste_uid: config.luceed_nalog_prodaje_sa__skladiste_uid, // Maloprodaja
      na__skladiste_uid: config.luceed_nalog_prodaje_na__skladiste_uid, // Webshop virtual skladiste
      skl_dokument: config.luceed_nalog_prodaje_skl_dokument,

      /**
       * TODO: Remove for testing
       */
      skladiste_uid: config.luceed_nalog_prodaje_sa__skladiste_uid,

      /**
       * Status
       * TODO: For testing!! ONLY! Remove later!
       *
       * status=99 (Storno) - to mark it for deletion - for testing purposes.
       * Later - remove this status.
       */
      // status: "Storno",
      status: config.luceed_nalog_status,

      /**
       * Stavke
       */
      stavke: stavke,

      /**
       * Payment
       */
      placanja: [placanje],
    };
    const data: ILuceedCreateOrdersRequest = {
      nalozi_prodaje: [orderData],
    };
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
