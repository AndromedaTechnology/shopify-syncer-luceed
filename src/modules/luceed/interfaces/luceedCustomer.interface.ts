export interface ILuceedCreateCustomerRequest {
  partner: Array<ILuceedCustomer>;
}
export interface ILuceedCustomer {
  /**
   * UID of this partner
   *
   * Used to reference Customer in NalogProdaje
   */
  partner_uid?: string;
  /**
   * @deprecated
   * Now using grupa_partnera_uid.
   * ALWAYS SET TO WEBSHOP_CUSTOMERS UID
   */
  // parent__partner_uid?: string;
  /**
   * REQUIRED
   */
  grupa_partnera_uid?: string;
  /**
   * REQUIRED
   *
   * naziv ili ime
   *
   * Naziv partnera
   */
  naziv?: string;
  /**
   * REQUIRED
   *
   * naziv ili ime
   *
   * ime je za fizicku osobu
   */
  ime?: string;
  /**
   * REQUIRED?
   *
   * naziv ili ime
   *
   * prezime je za fizicku osobu
   */
  prezime?: string;

  /**
   * REQUIRED
   *
   * Set to D by default!
   * [D/N]
   */
  enabled?: string;

  /**
   * REQUIRED
   * Set to F by default!
   * [P/F]
   * pravna/fizicka
   */
  tip_komitenta?: string;

  /**
   * CONTACT
   */
  mobitel?: string;
  telefon?: string;
  e_mail?: string;

  /**
   * REQUIRED.
   * Tip cijene, V ako ništa nije upisano (veleprodajna/maloprodajna)
   * [V/M]
   *
   * M mora biti, maloprodajna cijena.
   */
  tip_cijene?: string;

  /**
   * LOCATION
   */

  adresa?: string;
  postanski_broj?: string;
  /**
   * Required to find and compare if Customer is already saved (by email and shipping address)
   */
  mjesto_uid?: string;
  /**
   * Naziv mjesta
   */
  naziv_mjesta?: string;
  /**
   * Sifra mjesta
   */
  mjesto?: string;

  /**
   * Ako je pravna osoba
   */
  oib?: string;
}
/**
 * For some reason this is a bug in Luceed.
 * Here should be partneri, not partner.
 * As it returns array of items.
 *
 * So, this interface is needed, to disambiugate from regular response.
 */
export interface ILuceedCustomersByEmailResponse {
  result: Array<{ partner: Array<ILuceedCustomer> }>;
}
export interface ILuceedCustomersResponse {
  result: Array<{ partneri: Array<ILuceedCustomer> }>;
}
export interface ILuceedCreateCustomerResponse {
  /**
   * Array of partner UID(s)
   */
  result: Array<string>;
}
