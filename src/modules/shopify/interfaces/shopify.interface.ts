export interface IShopifyCreateProductVariantResponse {
  variant: IShopifyProductVariant;
}
export interface IShopifyProductVariantsResponse {
  variants: Array<IShopifyProductVariant>;
}

export interface IShopifyProductVariant {
  id?: number;
  product_id?: number;
  /**
   * Requires shipping
   * This should set `This is physical product` in Shopify to true.
   *
   * SET to TRUE.
   */
  requires_shipping?: boolean;

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
   * Continue or deny selling when out of stock.
   *
   * Set to DENY.
   */
  inventory_policy?: ShopifyProductVariantInventoryPolicy;

  /**
   * Name of the variant?
   */
  option1?: string;
}

export enum ShopifyProductVariantInventoryPolicy {
  DENY = "deny",
  CONTINUE = "continue",
}

export enum IShopifyProductStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  DRAFT = "draft",
}
export interface IShopifyProduct {
  /**
   * This is for response.
   * We don't send this.
   */
  id?: number;
  handle: string;
  title: string;
  vendor: string;
  body_html?: string;
  status?: IShopifyProductStatus;

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

export interface IShopifyInventoryItem {
  id?: number;
  sku?: string;
  cost?: string;
  created_at?: string;
  updated_at?: string;
}
export interface IShopifyUpdateInventoryItem {
  inventory_item: IShopifyInventoryItem;
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
export interface IShopifyCustomerAddress {
  // address1: The street address of the billing address.
  address1?: string;
  // address2: An optional additional field for the street address of the billing address.
  address2?: string;
  // city: The city, town, or village of the billing address.
  city?: string;
  // company: The company of the person associated with the billing address.
  company?: string;
  // country: The name of the country of the billing address.
  country?: string;
  // country_code: The two-letter code (ISO 3166-1 format) for the country of the billing address.
  country_code?: string;
  // first_name: The first name of the person associated with the payment method.
  first_name?: string;
  // last_name: The last name of the person associated with the payment method.
  last_name?: string;
  // latitude: The latitude of the billing address.
  latitude?: string;
  // longitude: The longitude of the billing address.
  longitude?: string;
  // name: The full name of the person associated with the payment method.
  name?: string;
  // phone: The phone number at the billing address.
  phone?: string;
  // province: The name of the region (for example, province, state, or prefecture) of the billing address.
  province?: string;
  // province_code: The two-letter abbreviation of the region of the billing address.
  province_code?: string;
  // zip: The postal code (for example, zip, postcode, or Eircode) of the billing address.
  zip?: string;
}

export interface IShopifyOrder {
  /**
   * Returned
   */
  id: number;
  /**
   * Returned.
   * ID of order on Webshop.
   * TODO: Check if this is ALWAYS returned.
   *
   * This is used to set `narudzba` in LuceedNalogProdaje.
   */
  name: string;
  number: number;
  order_number: number;
  order_status_url: string;

  line_items?: Array<IShopifyOrderLineItem>;

  payment_terms?: any;
  refunds: Array<any>;

  /**
   * ADRESSES
   */

  /**
   * Shipping address
   */
  shipping_address?: IShopifyCustomerAddress;

  /**
   * Billing address
   * What is this?
   */
  billing_address?: IShopifyCustomerAddress;

  note?: string;
  created_at?: string;
  confirmed?: boolean;

  /**
   * What is this?
   */
  fulfillment_status?: any;

  /**
   * Financial status
   *
   * pending: The payments are pending. Payment might fail in this state. Check again to confirm whether the payments have been paid successfully.
   * authorized: The payments have been authorized.
   * partially_paid: The order has been partially paid.
   * paid: The payments have been paid.
   * partially_refunded: The payments have been partially refunded.
   * refunded: The payments have been refunded.
   * voided: The payments have been voided.
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
  /**
   * TODO: Is email or contact_email to BE USED for checking if Luceed customer is already created?
   * Is email always returned?
   *
   * The customer's email address.
   */
  email?: string;
  contact_email?: string;
  customer_locale?: string;

  /**
   * What is this?
   */
  customer?: IShopifyCustomer;
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

  /**
   * Shipping cost
   *
   * TODO: Check for taxes and discounts,
   * how it affects.
   *
   * The total shipping price of the order, excluding discounts and returns,
   * in shop and presentment currencies.
   * If taxes_included is set to true, then total_shipping_price_set includes taxes.
   *
   * TODO: What is diff between shop_money and presentment_money?
   */
  total_shipping_price_set: {
    shop_money?: {
      amount?: string;
      currency_code?: string;
    };
    presentment_money?: {
      amount?: string;
      currency_code?: string;
    };
  };
  /**
   * TODO: Check if use shipping_lines or total_shipping_price_set.
   * For calculation of total shipping price.
   */
  shipping_lines: Array<any>;

  /**
   * Discounts
   */

  /**
   * General coupon applied
   */
  discount_codes?: Array<IShopifyOrderDiscount>;
  /**
   * Use this to determine percentage per product to take off
   */
  discount_applications?: Array<IShopifyOrderDiscountApplication>;
}

export enum ShopifyOrderDiscountApplicationType {
  DISCOUNT_CODE = "discount_code",
}
export enum ShopifyOrderDiscountApplicationValueType {
  PERCENTAGE = "percentage",
}
export enum ShopifyOrderDiscountApplicationTargetType {
  LINE_ITEM = "line_item",
}
export enum ShopifyOrderDiscountApplicationTargetSelection {
  ALL = "all",
}
export enum ShopifyOrderDiscountApplicationAllocationMethod {
  ACROSS = "across",
}
export interface IShopifyOrderDiscountApplication {
  target_type?: ShopifyOrderDiscountApplicationTargetType;
  type?: ShopifyOrderDiscountApplicationType;
  target_selection?: ShopifyOrderDiscountApplicationTargetSelection;
  value_type?: ShopifyOrderDiscountApplicationValueType;
  allocation_method?: ShopifyOrderDiscountApplicationAllocationMethod;
  // e.g. value?: "10.0";
  value?: string;
  // e.g. code?: "CEKER10";
  code?: string;
}
export interface IShopifyOrderDiscount {
  /**
   * e.g. "CEKER10"
   */
  code?: string;
  /**
   * e.g. "0.75"
   */
  amount?: string;
  /**
   * e.g. "percentage"
   */
  type?: string;
}
export interface IShopifyOrdersResponse {
  orders: Array<IShopifyOrder>;
}

export interface IShopifyCustomer {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}
