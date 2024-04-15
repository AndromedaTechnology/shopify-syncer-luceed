export interface ILuceedCustomer {
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

  adresa?: string;
  telefon?: string;
  mobitel?: string;
  e_mail?: string;
  postanski_broj?: string;

  /**
   * TODO: Sto je ovo? Potrebno?
   * Tip cijene, V ako ništa nije upisano (veleprodajna/maloprodajna)
   * [V/M]
   */
  tip_cijene?: string;
  /**
   * TODO: Sto je ovo? Potrebno?
   */
  maticni_broj?: string;
  /**
   * TODO: Sto je ovo? Potrebno?
   */
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
