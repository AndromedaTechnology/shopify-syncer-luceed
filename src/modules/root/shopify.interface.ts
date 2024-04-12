export interface IShopifyProductVariant {
  id?: number;
  product_id?: number;
  /**
   * Required to set everywhere!
   */
  sku: string;
  /**
   * Price
   * "20.00"
   */
  price?: string;

  /**
   * There is a 1:1 relationship between a product variant and an inventory item.
   */
  inventory_item_id?: number;

  /**
   * SET  TO shopify ALWAYS!
   *
   * The fulfillment service that tracks the number of items in stock for the product variant. Valid values:

    shopify: You are tracking inventory yourself using the admin.
    null: You aren't tracking inventory on the variant.
    the handle of a fulfillment service that has inventory management enabled: This must be the same fulfillment service referenced by the fulfillment_service property.

   */
  inventory_management?: string;

  /**
   * Name of the variant?
   */
  option1?: string;
}

export interface IShopifyProduct {
  /**
   * This is for response.
   * We don't send this.
   */
  id?: string;
  handle: string;
  title: string;
  vendor: string;
  body_html?: string;

  /**
   * @note
   * SKU is defined on variant.
   */
  // sku?: string;

  /**
   * Optional
   */
  tags?: Array<string>;

  /**
   * Variants
   */
  variants?: Array<IShopifyProductVariant>;
}

export interface IShopifyProductsResponse {
  products: Array<IShopifyProduct>;
}

export interface IShopifyProductCreateResponse {
  product: IShopifyProduct;
}

export interface IShopifyLocation {
  id?: number;
  name?: string;
  active?: boolean;
}
export interface IShopifyLocationsResponse {
  locations: Array<IShopifyLocation>;
}
export interface IShopifyLocationResponse {
  location: IShopifyLocation;
}

export interface IShopifyInventoryLevel {
  inventory_item_id?: number;
  location_id?: number;
  available?: number;
  updated_at?: string;
}
export interface IShopifySetInventoryLevelResponse {
  inventory_level: IShopifyInventoryLevel;
}
