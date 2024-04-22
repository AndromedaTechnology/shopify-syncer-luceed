import {
  ILuceedOrder,
  ILuceedCreateOrderProduct,
} from "../../luceed/interfaces/luceedOrder.interface";
import { IShopifyOrder } from "../interfaces/shopify.interface";
import luceedOrderService from "../../luceed/services/luceedOrder.service";
import luceedCustomerService from "../../luceed/services/luceedCustomer.service";
import { ILuceedCustomer } from "../../luceed/interfaces/luceedCustomer.interface";
import { ILuceedProduct } from "../../luceed/interfaces/luceedProduct.interface";
import luceedProductService from "../../luceed/services/luceedProduct.service";
import shopifyOrdersService from "./shopifyOrders.service";
import orderService from "../../order/order.service";

export interface IShopifyOrderSyncStatus {
  orders_created_cnt?: number;
  customers_created_cnt?: number;
}
class ShopifyService {
  async syncShopifyOrdersToLuceed(
    shopifyOrders: Array<IShopifyOrder>,
    luceedOrders: Array<ILuceedOrder>,
    luceedProducts: Array<ILuceedProduct>
  ): Promise<IShopifyOrderSyncStatus> {
    if (!shopifyOrders) {
      return {};
    }
    let response: IShopifyOrderSyncStatus = {
      orders_created_cnt: 0,
      customers_created_cnt: 0,
    };
    for (const shopifyOrder of shopifyOrders) {
      const orderName = shopifyOrdersService.getShopifyOrderName(shopifyOrder);
      /**
       * Save in local DB
       */
      const databaseOrder = await orderService.touch(undefined, orderName, {
        order_id: shopifyOrder.id,
        name: shopifyOrder.name,
        number: shopifyOrder.number,
        order_number: shopifyOrder.order_number,
        created_at: shopifyOrder.created_at
          ? new Date(shopifyOrder.created_at)
          : undefined,
        confirmed: shopifyOrder.confirmed,
        fulfillment_status: shopifyOrder.fulfillment_status,
      });

      const email = shopifyOrdersService.getShopifyOrderEmail(shopifyOrder);
      if (!email) {
        continue;
        // throw `shopify order has no email: ${orderName}`;
      }
      const luceedOrder = this.getLuceedOrderByShopifyOrderId(
        orderName,
        luceedOrders
      );
      if (!luceedOrder) {
        const luceedOrderId = await this.createLuceedOrder(
          shopifyOrder,
          luceedProducts
        );
        if (luceedOrderId) {
          response = {
            ...response,
            orders_created_cnt: (response?.orders_created_cnt ?? 0) + 1,
          };
        }
      } else {
        /**
         * TODO: Update order
         * [cancel_reason,cancelled_at]
         * [buyer_accepts_marketing]
         * [billing_address]
         * [closed_at]
         * [customer]
         */
      }
    }
    return response;
  }

  async createLuceedOrder(
    shopifyOrder: IShopifyOrder,
    luceedProducts: Array<ILuceedProduct>
  ): Promise<string | undefined> {
    /**
     * PARTNER
     */
    const luceedPartner = await this.getLuceedCustomerByEmail(shopifyOrder);
    if (!luceedPartner || !luceedPartner.partner_uid) return;

    /**
     * STAVKE
     */
    let stavke: Array<ILuceedCreateOrderProduct> =
      await this.getLuceedStavkeFromShopifyOrder(shopifyOrder, luceedProducts);

    /**
     * PLACANJE
     */
    let placanjeIznos: number | undefined =
      await this.getLuceedPlacanjeIznosFromShopifyOrder(shopifyOrder);
    if (!placanjeIznos) return;

    const luceedOrderId = await luceedOrderService.createOrder(
      shopifyOrder.created_at
        ? luceedOrderService.getDateForLuceed(
            new Date(shopifyOrder.created_at)
          )!
        : luceedOrderService.getDateForLuceed(new Date())!,
      shopifyOrdersService.getShopifyOrderName(shopifyOrder),
      luceedPartner.partner_uid!,
      stavke,
      placanjeIznos
    );
    return luceedOrderId;
  }

  /**
   * STAVKE
   * TODO:
   */
  private async getLuceedStavkeFromShopifyOrder(
    shopifyOrder: IShopifyOrder,
    luceedProducts: Array<ILuceedProduct>
  ): Promise<Array<ILuceedCreateOrderProduct>> {
    if (!shopifyOrder.line_items) return [];
    let stavke: Array<ILuceedCreateOrderProduct> = [];
    for (const lineItems of shopifyOrder.line_items) {
      const luceedProduct = luceedProductService.getLuceedProductBySKU(
        lineItems.sku,
        luceedProducts
      );
      if (!luceedProduct || !luceedProduct.artikl_uid) {
        throw "luceed product not found by SKU from shopify product in line item in order";
        continue;
      }
      const stavka: ILuceedCreateOrderProduct = {
        artikl_uid: luceedProduct.artikl_uid,
        kolicina: lineItems.quantity, // TODO: Or currentQuanity?
      };
      stavke.push(stavka);
    }
    return stavke;
  }

  /**
   * PLACANJE
   * TODO:
   */
  private async getLuceedPlacanjeIznosFromShopifyOrder(
    shopifyOrder: IShopifyOrder
  ): Promise<number | undefined> {
    return 123.45;
    // return undefined;
  }

  /**
   * TODO: Check
   *
   * Create Customer by email
   * What if multiple partners returned? Get first one?
   *
   * TODO: Use shopifyOrder.customer.email
   * OR
   * shopifyOrder.email?
   */
  private async getLuceedCustomerByEmail(
    shopifyOrder: IShopifyOrder
  ): Promise<ILuceedCustomer | undefined> {
    const email = shopifyOrdersService.getShopifyOrderEmail(shopifyOrder);
    /**
     * No email for customer - skip ORDER
     */
    if (!email) return undefined;

    let luceedPartner = undefined;
    const luceedPartners = await luceedCustomerService.fetchCustomersByEmail(
      email
    );
    if (!luceedPartners || luceedPartners.length === 0) {
      luceedPartner = await this.createLuceedCustomerFromShopifyOrder(
        shopifyOrder
      );
    } else if (luceedPartners.length) {
      luceedPartner = luceedPartners[0];
    }

    return luceedPartner;
  }

  /**
   * TODO: Check
   */
  private async createLuceedCustomerFromShopifyOrder(
    shopifyOrder: IShopifyOrder
  ): Promise<ILuceedCustomer | undefined> {
    const email = shopifyOrdersService.getShopifyOrderEmail(shopifyOrder);
    if (!email) return undefined;

    const customerData =
      shopifyOrdersService.getShopifyOrderCustomerData(shopifyOrder);
    /**
     * General
     */
    const first_name = customerData?.first_name;
    const last_name = customerData?.last_name;
    const phone = customerData?.phone;
    /**
     * Location data
     */
    const locationZip = customerData?.zip;
    const locationAddress = `${customerData?.address1}, ${customerData?.address2},${customerData?.city}, ${customerData?.province}, ${locationZip}, ${customerData?.country}`;
    /**
     * Property `customer.adresa` has VARCHAR(200) type.
     * So, send only 200 max chars.
     */
    const locationAddressTrimmed = locationAddress.substring(0, 200);
    /**
     * Create Customer
     */
    const luceedCustomerId = await luceedCustomerService.createCustomer(
      first_name,
      last_name,
      phone,
      phone,
      email,
      /**
       * Delivery data
       * TODO: Check
       */
      locationZip,
      undefined, // TODO: mjesto UID
      locationAddressTrimmed,
      undefined // TODO: maticni broj
    );
    // console.log({
    //   luceedCustomerId: luceedCustomerId,
    //   first_name: shopifyOrder.customer.first_name,
    //   last_name: shopifyOrder.customer.last_name,
    //   phone: shopifyOrder.customer.phone,
    //   email: email,
    // });
    // return undefined;
    if (!luceedCustomerId) return undefined;
    const luceedCustomers = await luceedCustomerService.fetchCustomersByEmail(
      email!
    );
    return luceedCustomers && luceedCustomers.length
      ? luceedCustomers[0]
      : undefined;
  }

  /**
   * Get Order in Luceed that has `narudzba`field === to ShopifyOrderId.
   * This field is used to match orders across systems.
   *
   * TODO: Move to helper
   */
  private getLuceedOrderByShopifyOrderId(
    shopifyOrderId: string,
    luceedOrders: Array<ILuceedOrder>
  ): ILuceedOrder | undefined {
    if (!shopifyOrderId) return undefined;
    let item: ILuceedOrder | undefined = undefined;
    item = luceedOrders.find(
      (luceedOrder) => luceedOrder.narudzba === shopifyOrderId
    );
    return item;
  }
}

export default new ShopifyService();
