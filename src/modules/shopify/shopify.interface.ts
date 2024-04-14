export interface IShopifyProductVariantsResponse {
  variants: Array<IShopifyProductVariant>;
}

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

/**
 * Orders
 */

export interface IShopifyOrderLineItem {
  id: string;
  vendor: string;
  variant_id: number;
  variant_title: string;
  variant_inventory_management: string;
  sku: string;
  name: string;
  title: string;
  price: string;
  quantity: number;
  current_quantity: number;
  requires_shipping: boolean;

  taxable: boolean;
  /**
   * 0.00
   */
  total_discount: string;

  // product_exists: true;
  product_exists: boolean;
  // product_id: 921728736;
  product_id: number;

  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string;
}

export interface IShopifyOrder {
  /**
   * Returned
   */
  id: number;
  /**
   * Returned.
   * ID of order on Webshop.
   */
  name: string;
  number: number;
  order_number: number;
  order_status_url: string;

  line_items?: Array<IShopifyOrderLineItem>;

  payment_terms?: any;
  refunds: Array<any>;
  shipping_address: any;
  shipping_lines: Array<any>;

  note?: string;
  created_at?: string;
  confirmed?: boolean;

  /**
   * What is this?
   */
  fulfillment_status?: any;

  /**
   * [paid]
   */
  financial_status?: string;
  currency?: string;
  /**
   * "199.99"
   */
  subtotal_price?: string;
  current_subtotal_price?: string;
  current_total_price?: string;
  current_total_tax?: string;
  /**
   * 0.00
   */
  total_discounts?: string;

  /**
   * Customer
   */
  phone?: string;
  email?: string;
  contact_email?: string;
  customer_locale?: string;
  /**
   * What is this?
   */
  billing_address?: any;
  /**
   * What is this?
   */
  customer?: any;
  /**
   * What is this?
   */
  fulfillments?: any;

  /**
   * Other
   */
  po_number?: any;
  updated_at?: any;
  processed_at?: any;
  cancelled_at?: any;
  cart_token?: any;
  checkout_id?: any;
}
export interface IShopifyOrdersResponse {
  orders: Array<IShopifyOrder>;
}
