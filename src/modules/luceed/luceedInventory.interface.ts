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
