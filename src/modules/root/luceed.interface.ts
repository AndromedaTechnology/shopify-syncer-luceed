export interface ILuceedInventoryItem {
  // artikl_uid: "1266-3228";
  artikl_uid?: string;
  // skladiste_uid: "1-3228";
  skladiste_uid?: string;
  // stanje_kol: 77;
  stanje_kol?: number;
  // raspolozivo_kol: 77;
  raspolozivo_kol?: number;
  // stanje: "D";
  stanje?: string;
  // raspolozivo: "D";
  raspolozivo?: string;
}
export interface ILuceedInventoryResponse {
  result: Array<{ stanje: Array<ILuceedInventoryItem> }>;
}

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

/**
 * Orders
 */

export interface ILuceedOrder {
  // Upisuje se ukoliko se mijenja nalog prodaje
  nalog_prodaje_uid?: string;

  /**
   * REQUIRED
   * TODO: What is this?
   *
   * PK naloga prodaje iz B2B aplikacije
   */
  nalog_prodaje_b2b?: string;
  /**
   * Broj narudžbe
   * Broj se dodjeljuje prema skladištu kao prvi sljedeći.
   */
  broj?: number;

  /**
   * REQUIRED
   *
   * Datum narudžbe
   */
  datum?: Date;

  /**
   * REQUIRED
   * Šifra skladišta iz Luceed-a
   */
  skladiste?: string;

  /**
   * REQUIRED
   *
   * Šifra partnera iz Luceed-a
   * Upisuje se partner na kojeg glasi nalog
   */
  partner?: string;

  /**
   * TODO: Cemu ovo sluzi?
   * Koja je razlika u odnosu na `partner` field?
   *
   * Šifra korisnika (partnera) iz Luceed-a
   * Upisuje se partner kojem se dostavlja narudžba.
   *  */
  korisnik__partner?: string;

  /**
   * REQUIRED
   * * TODO: Cemu ovo sluzi?
   * Ovo je custom field, ovdje spremamo Shopify order number?
   *
   * narudzba
   * Broj narudžbe od kupca
   * Upotreba kod veleprodajnih narudžbi
   */
  narudzba?: string;

  /**
   * Ovdje mozemo staviti Shopify order number ili
   * ovdje ide napomena od strane kupca s webshopa?
   */
  napomena?: string;

  /**
   * TODO: Cemu ovo?
   * [D/N]
   */
  kupac_placa_isporuku?: string;

  /**
   * Dodatno, u odnosu na Create DTO:
   */
  status?: string;
  osnovica?: number;
  pdv?: number;
  jir?: number;
  zki?: number;
}
export interface ILuceedOrderCreateDto {
  nalozi_prodaje: Array<ILuceedOrderCreateItem>;
}
export interface ILuceedOrderCreateItem {
  // Upisuje se ukoliko se mijenja nalog prodaje
  nalog_prodaje_uid?: string;

  /**
   * REQUIRED
   * TODO: What is this?
   *
   * PK naloga prodaje iz B2B aplikacije
   */
  nalog_prodaje_b2b?: string;
  /**
   * Broj narudžbe
   * Broj se dodjeljuje prema skladištu kao prvi sljedeći.
   */
  broj?: number;

  /**
   * REQUIRED
   *
   * Datum narudžbe
   */
  datum?: Date;

  /**
   * REQUIRED
   * Šifra skladišta iz Luceed-a
   */
  skladiste?: string;

  /**
   * REQUIRED
   *
   * Šifra partnera iz Luceed-a
   * Upisuje se partner na kojeg glasi nalog
   */
  partner?: string;

  /**
   * TODO: Cemu ovo sluzi?
   * Koja je razlika u odnosu na `partner` field?
   *
   * Šifra korisnika (partnera) iz Luceed-a
   * Upisuje se partner kojem se dostavlja narudžba.
   *  */
  korisnik__partner?: string;

  /**
   * REQUIRED
   * * TODO: Cemu ovo sluzi?
   * Ovo je custom field, ovdje spremamo Shopify order number?
   *
   * narudzba
   * Broj narudžbe od kupca
   * Upotreba kod veleprodajnih narudžbi
   */
  narudzba?: string;

  /**
   * Ovdje mozemo staviti Shopify order number ili
   * ovdje ide napomena od strane kupca s webshopa?
   */
  napomena?: string;

  /**
   * TODO: Cemu ovo?
   * [D/N]
   */
  kupac_placa_isporuku?: string;

  /**
   * TODO: Cemu ovo?
   * TODO: Rename. Wrong name?
   * [D/N]
   */
  cijene_s_porezom?: string;

  /**
   * REQUIRED FOR US (CREATE)
   *
   * Iznos ukupne vrijednosti narudžbe
   */
  iznos?: number;

  /**
   * TODO: Sto ide ovdje - za placanje pouzecem?
   * Lista pripadjućih atributa plaćanja i njihovih vrijednosti (tablica 17)
   */
  placanja?: Array<ILuceedOrderPayment>;

  /**
   * TODO: Sto ide ovdje
   * Lista stavaka naloga
   */
  stavke?: Array<ILuceedOrderProductItem>;

  /**
   * TODO: Sto ide ovdje
   * Lista grupa stavaka
   */
  grupe?: Array<ILuceedOrderGroup>;
}

export interface ILuceedOrderGroup {
  //
}
export interface ILuceedOrderProductItem {
  /**
   * REQUIRED
   * Šifra artikla u Luceed-u
   */
  artikl: string;
  /**
   * REQUIRED
   * Količina na narudžbi
   */
  kolicina: number;

  /**
   * Optional.
   * Default se postavlja cijena iz Luceeda.
   */
  cijena?: number;
  /**
   * Optional.
   * Rabat postotak.
   * Default se postavlja cijena iz Luceeda.
   */
  rabat?: number;
  /**
   * Optional.
   * Rabat postotak.
   * Default se postavlja cijena iz Luceeda.
   */
  dodatni_rabat?: number;
}
export interface ILuceedOrderPayment {
  /**
   * REQUIRED
   */
  vrsta_placanja: string;
  /**
   * REQUIRED
   */
  iznos: string;
}
export interface ILuceedOrderCreateResponse {
  /**
   * Array has Luceed.order.uid
   */
  result: Array<string>;
}
export interface ILuceedOrderResponse {
  result: Array<{ nalozi_prodaje: Array<ILuceedOrder> }>;
}
