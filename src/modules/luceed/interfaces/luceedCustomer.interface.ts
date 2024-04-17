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
   * REQUIRED
   * ALWAYS SET TO WEBSHOP_CUSTOMERS UID
   */
  parent__partner_uid?: string;
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
   * TODO: Sto je ovo? Potrebno?
   */
  maticni_broj?: string;
  /**
   * TODO: Sto je ovo? Potrebno?
   */
  mjesto_uid?: string;
  mjesto?: string;

  /**
   * Ako je pravna osoba
   */
  oib?: string;
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
