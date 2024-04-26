export interface ILuceedCreateMjestoRequest {
  mjesto: Array<ILuceedMjesto>;
}
export interface ILuceedMjesto {
  mjesto_uid?: string;
  naziv?: string;
  postanski_broj?: string;
  drzava_uid?: string;
}
export interface ILuceedMjestaResponse {
  result: Array<{ mjesta: Array<ILuceedMjesto> }>;
}
export interface ILuceedCreateMjestoResponse {
  /**
   * Array of mjesta UID(s)
   */
  result: Array<string>;
}
