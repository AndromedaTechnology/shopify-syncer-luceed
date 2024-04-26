import axios from "axios";

import config from "../../../config";

import {
  ILuceedCustomer,
  ILuceedCustomersResponse,
  ILuceedCreateCustomerResponse,
  ILuceedCreateCustomerRequest,
  ILuceedCustomersByEmailResponse,
} from "../interfaces/luceedCustomer.interface";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";

const luceedUsername = config.luceed_username;
const luceedPassword = config.luceed_password;

/**
 * Luceed
 */
class LuceedCustomerService {
  printCustomers(items: Array<ILuceedCustomer>) {
    for (const item of items) {
      console.log({
        naziv: item.naziv,
        ime: item.ime,
        enabled: item.enabled,
        tip_komitenta: item.tip_komitenta,
        tip_cijene: item.tip_cijene,
        e_mail: item.e_mail,
        telefon: item.telefon,
        mjesto: item.mjesto,
        postanski_broj: item.postanski_broj,
      });
    }
  }

  /**
   * @param {string} cityName From Shopify.city
   */
  filterCustomersByEmailShipping(
    customers: Array<ILuceedCustomer>,
    email?: string,
    zipCode?: string,
    cityName?: string
  ): Array<ILuceedCustomer> {
    return customers?.filter((customer) => {
      let isValid = true;
      if (email) {
        isValid =
          isValid && email.toLowerCase() === customer.e_mail?.toLowerCase();
      }
      if (zipCode) {
        isValid =
          isValid &&
          zipCode.toLowerCase() === customer.postanski_broj?.toLowerCase();
      }
      /**
       * Mjesto (naziv)
       */
      if (cityName) {
        isValid =
          isValid &&
          cityName.toLowerCase() === customer.naziv_mjesta?.toLowerCase();
      }
      return true;
    });
  }

  /**
   * Fetch by naziv (ALL)
   */
  async fetchCustomers(naziv?: string): Promise<Array<ILuceedCustomer>> {
    var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/naziv/${naziv}`;
    // var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/lista/[${startPosition},${amountToReturn}]`;
    let response: ILuceedCustomersResponse | undefined = undefined;
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
    // console.log("--luceed-customers-", naziv, response);
    return response?.result[0]?.partneri ?? [];
  }

  /**
   * Fetch by email
   */
  async fetchCustomersByEmail(email: string): Promise<Array<ILuceedCustomer>> {
    var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/email/${email}`;
    // var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/lista/[${startPosition},${amountToReturn}]`;
    let response: ILuceedCustomersByEmailResponse | undefined = undefined;
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
    // console.log("--luceed-customers-email", email, response);
    return response?.result[0]?.partner ?? [];
  }

  /**
   * @returns customerUID
   */
  async createCustomer(
    ime?: string,
    prezime?: string,
    telefon?: string,
    mobitel?: string,
    email?: string,
    postanskiBroj?: string,
    mjestoUid?: string,
    adresa?: string,
    customerData: ILuceedCustomer = {},
    isDebug = true
  ): Promise<string | undefined> {
    var url = `https://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/snimi/`;
    let response: ILuceedCreateCustomerResponse | undefined = undefined;

    customerData = {
      ...(customerData ?? {}),
      grupa_partnera_uid: config.luceed_partner_grupa_partnera_uid,
      ime: ime,
      prezime: prezime,
      naziv: ime + " " + prezime,
      enabled: "D",
      tip_komitenta: "F",

      /**
       * Contact
       */
      mobitel: mobitel,
      telefon: telefon,
      e_mail: email,

      /**
       * Price type
       */
      tip_cijene: "M",

      /**
       * Location
       *
       * TODO: Explain every field,
       * optional/required.
       * Way to get it's value.
       *
       * Adresa je required?
       * Sto je maticni broj?
       */
      postanski_broj: postanskiBroj,
      mjesto_uid: mjestoUid,
      adresa: adresa,
    };

    const data: ILuceedCreateCustomerRequest = {
      partner: [customerData],
    };
    // console.log("-data-create-customer", data);
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
    if (isDebug) {
      // console.log("--luceed-customers-", data, response);
    }
    return response?.result[0] ?? undefined;
  }
}

export default new LuceedCustomerService();
