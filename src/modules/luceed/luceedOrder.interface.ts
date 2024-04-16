/**
 * Create
 */

export interface ILuceedCreateOrdersResponse {
  /**
   * Array has Luceed.order.uid
   */
  result: Array<string>;
}
export interface ILuceedCreateOrdersInput {
  nalozi_prodaje: Array<ILuceedCreateOrder>;
}
export interface ILuceedCreateOrder {
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
   * DATE type
   * TODO: Convert to date before calling CreateOrder() and passing param.
   */
  datum?: string;

  /**
   * REQUIRED
   * Šifra skladišta iz Luceed-a
   */
  skladiste?: string;

  /**
   * REQUIRED, but optional if partner_uid sent.
   *
   * Šifra partnera iz Luceed-a
   * Upisuje se partner na kojeg glasi nalog
   */
  partner?: string;
  /**
   * REQUIRED
   *
   * Šifra partnera iz Luceed-a
   * Upisuje se partner na kojeg glasi nalog
   */
  partner_uid?: string;

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
   * Ovo je custom field, ovdje spremamo Shopify order number.
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
   * TODO: Sto ide ovdje
   * Lista stavaka naloga
   */
  stavke?: Array<ILuceedCreateOrderProduct>;

  /**
   * TODO: Sto ide ovdje - za placanje pouzecem?
   * Lista pripadjućih atributa plaćanja i njihovih vrijednosti (tablica 17)
   */
  placanja?: Array<ILuceedCreateOrderPayment>;

  /**
   * TODO: Sto ide ovdje
   * Lista grupa stavaka
   */
  grupe?: Array<ILuceedCreateOrderGroup>;

  /**
   * REQUIRED but optional.
   * Can be sent as status_uid.
   *
   * We send "Storno", instead of UID here.
   */
  status?: string;
  status_uid?: string;

  /**
   * REQUIRED
   *
   * Internal props
   * Skladiste - from, to, document
   *
   * Šifra skladišta sa kojeg se isporučuje roba u Luceed-u
   */
  sa__skladiste_uid?: string;
  /**
   * REQUIRED
   *
   * Internal props
   * Skladiste - from, to, document
   *
   * UID skladišta na koje se isporučuje roba u Luceed-u
   */
  na__skladiste_uid?: string;
  /**
   * REQUIRED
   *
   * Internal props
   * Skladiste - from, to, document
   *
   * Oznaka skladišnog dokumenta s kojim će roba biti isporučena u Luceed-u
   */
  skl_dokument?: string;
}
export interface ILuceedCreateOrderProduct {
  /**
   * REQUIRED
   * Šifra artikla u Luceed-u
   */
  artikl_uid: string;
  artikl?: string;
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
export interface ILuceedCreateOrderPayment {
  /**
   * REQUIRED
   */
  vrsta_placanja_uid?: string;
  vrsta_placanja?: string;
  /**
   * REQUIRED
   */
  iznos: string;
}
export interface ILuceedCreateOrderGroup {
  //
}

/**
 * Get
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

export interface ILuceedOrdersResponse {
  result: Array<{ nalozi_prodaje: Array<ILuceedOrder> }>;
}
