import axios from "axios";

import config from "../../config";

import {
  ILuceedCustomer,
  ILuceedCustomersResponse,
  ILuceedCreateCustomerResponse,
} from "./luceedCustomer.interface";

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
        maticni_broj: item.maticni_broj,
        mjesto: item.mjesto,
        postanski_broj: item.postanski_broj,
      });
    }
  }

  /**
   * TODO: Fetch all
   * TODO: Fetch by email
   */
  async fetchCustomers(
    startPosition = 0,
    amountToReturn = 1000
  ): Promise<Array<ILuceedCustomer>> {
    // var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/email/${email}`;
    var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/lista/[${startPosition},${amountToReturn}]`;
    let response: ILuceedCustomersResponse | undefined = undefined;
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
    console.log(
      "--luceed-customers-" + startPosition,
      amountToReturn,
      response
    );
    return response?.result[0]?.partneri ?? [];
  }

  /**
   * @returns customerUID
   */
  async createCustomer(
    ime: string,
    prezime: string,
    telefon: string,
    mobitel: string,
    email: string,
    postanskiBroj: string,
    mjestoUid: string,
    adresa: string,
    maticniBroj: string,
    data: ILuceedCustomer,
    startPosition = 0,
    amountToReturn = 1000,
    isDebug = true
  ): Promise<string | undefined> {
    var url = `http://luceedapi.tomsoft.hr:3816/datasnap/rest/partneri/snimi/`;
    let response: ILuceedCreateCustomerResponse | undefined = undefined;

    data = {
      ...data,
      ime: ime,
      prezime: prezime,
      enabled: "D",
      tip_komitenta: "F",

      /**
       * Contact
       */
      mobitel: mobitel,
      telefon: telefon,
      e_mail: email,

      /**
       * Location
       *
       * TODO: Explain every field,
       * optional/required.
       * Way to get it's value.
       *
       * Adresa, maticni_broj su required?
       * Sto je maticni broj?
       */
      postanski_broj: postanskiBroj,
      mjesto_uid: mjestoUid,
      adresa: adresa,
      maticni_broj: maticniBroj,

      tip_cijene: "M",
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
    if (isDebug) {
      console.log(
        "--luceed-customers-",
        data,
        startPosition,
        amountToReturn,
        response
      );
    }
    return response?.result[0] ?? undefined;
  }
}

export default new LuceedCustomerService();
