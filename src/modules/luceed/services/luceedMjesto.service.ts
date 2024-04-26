import axios from "axios";

import config from "../../../config";

import {
  ILuceedMjesto,
  ILuceedMjestaResponse,
  ILuceedCreateMjestoRequest,
  ILuceedCreateMjestoResponse,
} from "../interfaces/luceedMjesto.interface";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";
import { IShopifyOrder } from "../../shopify/interfaces/shopify.interface";
import shopifyOrdersService from "../../shopify/services/shopifyOrders.service";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Luceed
 */
class LuceedMjestoService {
  /**
   * Used where we need to get naziv mjesta
   * from Shopify order
   *
   * When comparing if Luceed customer already has this location added to their account,
   * or when creating Mjesto in Luceed,
   * to later attach it to new Customer.
   */
  getShopifyOrderMjestoNaziv(shopifyOrder: IShopifyOrder): string | undefined {
    const shipping = shopifyOrdersService.getShopifyOrderShipping(shopifyOrder);
    return shipping.city ?? shipping.province;
  }
  /**
   * Fetch by naziv (ALL)
   */
  async fetchMjesta(
    postanskiBroj: string,
    dioNazivaMjesta: string
  ): Promise<Array<ILuceedMjesto>> {
    var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/mjesta/postanskibroj/${postanskiBroj}/${dioNazivaMjesta}`;
    let response: ILuceedMjestaResponse | undefined = undefined;
    try {
      const axiosResponse = await axios({
        proxy: AxiosProxyHelper.getProxy(),
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
    // console.log("--luceed-mjesta-", naziv, response);
    return response?.result[0]?.mjesta ?? [];
  }

  /**
   * @returns customerUID
   */
  async createMjesto(
    postanskiBroj: string,
    nazivMjesta: string,
    countryUid: string,
    mjestoData: ILuceedMjesto = {},
    isDebug = true
  ): Promise<string | undefined> {
    var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/mjesta/snimi/`;
    let response: ILuceedCreateMjestoResponse | undefined = undefined;

    mjestoData = {
      ...(mjestoData ?? {}),
      naziv: nazivMjesta,
      postanski_broj: postanskiBroj,
      drzava_uid: countryUid,
    };

    const data: ILuceedCreateMjestoRequest = {
      mjesto: [mjestoData],
    };
    // console.log("-data-create-customer", data);
    try {
      const axiosResponse = await axios({
        proxy: AxiosProxyHelper.getProxy(),
        method: "put",
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
    if (isDebug) {
      console.log("--luceed-mjesto-", data, response);
    }
    return response?.result[0] ?? undefined;
  }
}

export default new LuceedMjestoService();
