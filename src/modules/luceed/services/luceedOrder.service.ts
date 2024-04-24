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
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Statusi
 *
 * Page 97 of docs.
 * Check if this is complete and true list.
 *
 * Used to query NaloziProdaje, by statusi.
 *
 * -- 01 - ovo mora biti na pocetku
 * -- 02 - rezervacija, kad dodje roba da se ne proda roba u ducanu nego ceka na tog customer (aunaprijed se rezervira)
 * -- 03 - ceka uplatu
 * -- 04 - odobren nalog (i uplata)  i moze se isprocuiciti roba
 * -- 05 - snimljena isporuka, spremno na slaganjem
 * -- 06 -otpremljeno
 * -- 99 - storno
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
    statusi: string = "01,02,03,04,05,06,99"
  ): Promise<Array<ILuceedOrder>> {
    var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/NaloziProdaje/statusi/[${statusi}]`;
    // var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/NaloziProdaje/uid/[${orderUid}]`;
    let response: ILuceedOrdersResponse | undefined = undefined;
    try {
      const axiosResponse = await axios({
        proxy: AxiosProxyHelper.getProxy(),
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
      // console.log("--luceed-orders-", axiosResponse);
      response = axiosResponse?.data;
    } catch (error) {
      console.log(error);
    }
    // console.log("--luceed-orders-", statusi, response);
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
    placanjeIznos: number,
    orderData: ILuceedCreateOrder = {}
  ): Promise<string | undefined> {
    var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/NaloziProdaje/snimi/`;
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
      datum: orderDate ?? this.getDateForLuceed(new Date()),
      nalog_prodaje_b2b: narudzba ?? "Shopify Order Test",
      narudzba: narudzba ?? "Shopify Order Test",
      cijene_s_porezom: "D",
      /**
       * Partner / customer
       */
      korisnik__partner_uid: luceedPartnerUid,
      // partner_uid: luceedPartnerUid,
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
       * Set to Webshop skladiste always.
       * (20)
       * (4-3228)
       */
      skladiste_uid: config.luceed_nalog_prodaje_skladiste_uid,

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
        proxy: AxiosProxyHelper.getProxy(),
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
    // console.log("--luceed-create-order-", response);
    return response?.result[0] ?? undefined;
  }

  getDateForLuceed(date: Date): string | undefined {
    if (!date) return undefined;
    const month = date.getUTCMonth() + 1; // months from 1-12
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    /**
     * For some reason, no dot after the year.
     */
    const newDate = `${day}.${month}.${year}`;
    return newDate;
  }
}

export default new LuceedOrdersService();
