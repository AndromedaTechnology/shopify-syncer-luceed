import axios from "axios";

import config from "../../../config";

import shopifyHelper from "../helpers/shopify.helper";
import { limiter } from "../../root/root.service";
import {
  IShopifyOrder,
  IShopifyOrdersResponse,
  ShopifyOrderDiscountApplicationAllocationMethod,
  ShopifyOrderDiscountApplicationTargetSelection,
  ShopifyOrderDiscountApplicationTargetType,
  ShopifyOrderDiscountApplicationType,
  ShopifyOrderDiscountApplicationValueType,
} from "../interfaces/shopify.interface";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";
import { ILuceedCreateOrderProduct } from "../../luceed/interfaces/luceedOrder.interface";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

/**
 * Merged data from Shopify.[shippingAddress,billingAddress]
 * If no data in shipping, take from billing.
 * To have any data, for start.
 */
export interface IShopifyOrderShipping {
  /**
   * Location
   */
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;

  /**
   * Person
   */

  /**
   * Phone
   */
  phone?: string;
  first_name?: string;
  last_name?: string;

  /**
   * Remove
   */
  // postanskiBroj?: string;
  // mjestoUid?: string;
  // adresa?: string;
  // maticniBroj?: string;
}

/**
 * Orders API
 * https://shopify.dev/docs/api/admin-rest/2024-01/resources/order
 *
 * Placing test Order - Tutorial
 * https://help.shopify.com/en/manual/checkout-settings/test-orders
 */
class ShopifyOrdersService {
  /**
   * Find first coupon code, with percent type
   *
   * This is to be applied only to items (without shipping).
   * If shipping also needs discount - customize this code or the calling code.
   *
   * TODO: Optionally implement more detailed coupon code filtering and determining final percentage
   */
  getShopifyOrderDiscountPercentage(
    shopifyOrder: IShopifyOrder
  ): number | undefined {
    if (!shopifyOrder) return undefined;
    if (!shopifyOrder.discount_applications) return undefined;

    let wholeOrderCouponPercentage: string | undefined = undefined;
    for (const discount_application of shopifyOrder.discount_applications) {
      if (
        discount_application.value_type !==
        ShopifyOrderDiscountApplicationValueType.PERCENTAGE
      ) {
        continue;
      }
      if (
        discount_application.type !==
        ShopifyOrderDiscountApplicationType.DISCOUNT_CODE
      ) {
        continue;
      }
      if (
        discount_application.target_type !==
        ShopifyOrderDiscountApplicationTargetType.LINE_ITEM
      ) {
        continue;
      }
      if (
        discount_application.target_selection !==
        ShopifyOrderDiscountApplicationTargetSelection.ALL
      ) {
        continue;
      }
      if (
        discount_application.allocation_method !==
        ShopifyOrderDiscountApplicationAllocationMethod.ACROSS
      ) {
        continue;
      }

      wholeOrderCouponPercentage = discount_application.value;
      break;
    }

    /**
     * Convert to number
     *
     * TODO: Support floating numbers.
     * Changed to parseInt, for Luceed.
     */
    let value: number | undefined = wholeOrderCouponPercentage
      ? Number.parseInt(wholeOrderCouponPercentage)
      : undefined;

    return value;
  }
  getShopifyOrderEmail(shopifyOrder: IShopifyOrder): string | undefined {
    const email =
      shopifyOrder.email ??
      shopifyOrder.contact_email ??
      shopifyOrder.customer?.email ??
      undefined;
    return email;
  }
  /**
   * TODO: Test with different Orders for Croatian Orders.
   * And adjust returning specific data - postal code etc.
   * Needed for luceed.
   *
   * TODO: Use for Creating Luceed orders.
   *
   * Used to get Luceed-adjusted data,
   * representing Shipping/Billing address.
   * Used for delivery purposes.
   *
   * TODO: We need to save billing and shipping data separately?
   */
  getShopifyOrderShipping(shopifyOrder: IShopifyOrder): IShopifyOrderShipping {
    let response = {
      address1:
        shopifyOrder?.shipping_address?.address1 ??
        shopifyOrder?.billing_address?.address1 ??
        undefined,
      address2:
        shopifyOrder?.shipping_address?.address2 ??
        shopifyOrder?.billing_address?.address2 ??
        undefined,
      city:
        shopifyOrder?.shipping_address?.city ??
        shopifyOrder?.billing_address?.city ??
        undefined,
      province:
        shopifyOrder?.shipping_address?.province ??
        shopifyOrder?.billing_address?.province ??
        undefined,
      country:
        shopifyOrder?.shipping_address?.country ??
        shopifyOrder?.billing_address?.country ??
        undefined,
      zip:
        shopifyOrder?.shipping_address?.zip ??
        shopifyOrder?.billing_address?.zip ??
        undefined,
      phone:
        shopifyOrder?.shipping_address?.phone ??
        shopifyOrder?.billing_address?.phone ??
        shopifyOrder.customer?.phone ??
        undefined,
      first_name:
        shopifyOrder?.shipping_address?.first_name ??
        shopifyOrder?.billing_address?.first_name ??
        shopifyOrder.customer?.first_name ??
        undefined,
      last_name:
        shopifyOrder?.shipping_address?.last_name ??
        shopifyOrder?.billing_address?.last_name ??
        shopifyOrder.customer?.last_name ??
        undefined,
    };
    return response;
  }

  /**
   * TODO: What is diff between shop_money and presentment_money?
   */
  private getShopifyOrderShippingPrice(
    shopifyOrder: IShopifyOrder
  ): string | undefined {
    if (!shopifyOrder) return undefined;
    const price =
      shopifyOrder.total_shipping_price_set?.shop_money?.amount ??
      shopifyOrder.total_shipping_price_set?.presentment_money?.amount;

    /**
     * We return undefined if 0.00.
     *
     * Just to make it easier to handle in calling methods.
     */
    if (price === "0.00") return undefined;
    return price;
  }

  /**
   * Return Luceed NalogProdaje stavka for Delivery
   *
   * If no shipping price on ShopifyOrder - add FREE Delivery item.
   * Otherwise, add default delivery item.
   */
  getShopifyOrderLuceedStavkaForDelivery(
    shopifyOrder: IShopifyOrder
  ): ILuceedCreateOrderProduct | undefined {
    if (!shopifyOrder) return undefined;
    const shippingPrice = this.getShopifyOrderShippingPrice(shopifyOrder);

    if (!shippingPrice) {
      if (config.luceed_nalog_prodaje_dostava_uid_free) {
        let stavka: ILuceedCreateOrderProduct = {
          artikl_uid: config.luceed_nalog_prodaje_dostava_uid_free,
          kolicina: 1,
        };
        return stavka;
      }
      return undefined;
    }

    if (config.luceed_nalog_prodaje_dostava_uid_default) {
      let stavka: ILuceedCreateOrderProduct = {
        artikl_uid: config.luceed_nalog_prodaje_dostava_uid_default,
        kolicina: 1,
      };
      return stavka;
    }
    return undefined;
  }

  /**
   * Used to set Luceed.narudzba field.
   */
  getShopifyOrderName(shopifyOrder: IShopifyOrder): string {
    const shopifyOrderName =
      shopifyOrder.name ??
      shopifyOrder.order_number?.toString() ??
      shopifyOrder.number?.toString();
    return config.luceed_nalog_prodaje_name_prefix + shopifyOrderName;
  }
  printOrders(orders: Array<IShopifyOrder>) {
    for (const order of orders) {
      console.log({
        name: order.name,
        number: order.number,
        order_number: order.order_number,
        created_at: order.created_at,
        confirmed: order.confirmed,
        fulfillment_status: order.fulfillment_status,
        currency: order.currency,
        total_discounts: order.total_discounts,
        phone: order.phone,
        email: order.email,
        contact_email: order.contact_email,
        billing_address: order.billing_address,
        customer: order.customer,
        id: order.id,
        note: order.note,
        line_items: order.line_items,
      });
    }
  }

  /**
   */
  async fetchOrders(
    paginationLimit = 250,
    isDebug = true,
    urlParam?: string
  ): Promise<Array<IShopifyOrder>> {
    var url;
    if (urlParam) {
      url = urlParam;
    } else {
      url = `https://${shopName}.myshopify.com/admin/api/2024-01/orders.json?status=any`;

      if (paginationLimit) {
        if (false) {
          url += "?";
        } else {
          url += "&";
        }
        url += `limit=${paginationLimit}`;
      }
    }

    let response: IShopifyOrdersResponse | undefined = undefined;
    /**
     * DONE?: Pagination links find
     * The only problem here is that we don't check for position of previous, next links.
     * But we assume that previous link is before next link.
     */
    let responseHeaders: any;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        // proxy: AxiosProxyHelper.getProxy(),
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
      responseHeaders = axiosResponse?.headers;
      if (isDebug) {
        // console.log("--orders-", urlParam, url, response?.orders);
      }
    } catch (error) {
      if (isDebug) {
        console.log(error);
      }
      throw error;
    }

    let orders = response?.orders ?? [];
    const nextLink =
      shopifyHelper.shopifyResponseHeaderGetNextLink(responseHeaders);
    if (nextLink) {
      const childProducts = await this.fetchOrders(
        undefined,
        undefined,
        nextLink
      );
      orders = [...orders, ...childProducts];
    }
    return orders ?? [];
  }
}

export default new ShopifyOrdersService();
