export interface ILuceedProduct {
  /**
   * IDS
   */
  id?: number;
  sid?: number;
  artikl_uid?: string;

  /**
   * Dobavljac
   * ["OPG Lovrenčić"]
   */
  glavni_dobavljac_naziv?: string;
  /**
   * "glavni_dobavljac_uid": "90-3228",
   */
  glavni_dobavljac_uid?: string;

  /**
   * Handle/SKU
   */
  artikl?: string;

  naziv?: string;
  jm?: string;

  vpc?: number;
  mpc?: number;
  nc?: number;

  /**
   * Enabled for Webshop?
   * [D/N]
   */
  webshop?: boolean;
  /**
   * What is enabled?
   * [D/N]
   */
  enabled?: boolean;

  /**
   * Usluga
   * [D/N]
   */
  usluga?: string;

  /**
   * Porezna
   * ["25"]
   */
  porezna_tarifa?: string;
  /**
   * Porezna
   * ["PDV 25%"]
   */
  porezna_tarifa_naziv?: string;
  /**
   * [25]
   */
  stopa_pdv?: number;
  /**
   * 0
   */
  ambalazna_naknada?: number;

  /**
   * Stanje
   * [D/N]
   */
  stanje?: string;
  /**
   * Raspolozivo
   * TODO: DIfference between stanje and raspolozivo?
   * [D/N]
   */
  raspolozivo?: string;

  /**
   * Količinsko stanje zalihe artikla
   *
   * TODO: This is not returned (filled) by Luceed API on Product Call (/artikli).
   * But rather, it's returned on StanjeSkladista call.
   */
  stanje_kol?: number;
  /**
   * Raspoloživa količina artikla (stanje zalihe umanjeno za rezervacije)
   *
   * TODO: This is not returned (filled) by Luceed API on Product Call (/artikli).
   * But rather, it's returned on StanjeSkladista call.
   */
  raspolozivo_kol?: number;
}
export interface ILuceedProductsResponse {
  result: Array<{ artikli: Array<ILuceedProduct> }>;
}
