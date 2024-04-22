import axios from "axios";

import config from "../../../config";

import shopifyHelper from "../helpers/shopify.helper";
import { limiter } from "../../root/root.service";
import {
  IShopifyOrder,
  IShopifyOrdersResponse,
} from "../interfaces/shopify.interface";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

/**
 * Merged data from Shopify.[shippingAddress,billingAddress]
 * If no data in shipping, take from billing.
 * To have any data, for start.
 */
export interface IShopifyOrderCustomerData {
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
   */
  getShopifyOrderCustomerData(
    shopifyOrder: IShopifyOrder
  ): IShopifyOrderCustomerData {
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
        shopifyOrder.customer?.phone ??
        shopifyOrder?.shipping_address?.phone ??
        shopifyOrder?.billing_address?.phone ??
        undefined,
      first_name:
        shopifyOrder.customer?.first_name ??
        shopifyOrder?.shipping_address?.first_name ??
        shopifyOrder?.billing_address?.first_name ??
        undefined,
      last_name:
        shopifyOrder.customer?.last_name ??
        shopifyOrder?.shipping_address?.last_name ??
        shopifyOrder?.billing_address?.last_name ??
        undefined,
    };
    return response;
  }
  /**
   * Used to set Luceed.narudzba field.
   */
  getShopifyOrderId(shopifyOrder: IShopifyOrder): string {
    return (
      shopifyOrder.name ?? shopifyOrder.number ?? shopifyOrder.order_number
    );
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
