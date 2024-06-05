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
import statusService from "../../status/status.service";
import luceedMjestoService from "../../luceed/services/luceedMjesto.service";
import { ILuceedMjesto } from "../../luceed/interfaces/luceedMjesto.interface";
import config from "../../../config";

export interface IShopifyOrderSyncStatus {
  orders_created_cnt?: number;
  customers_created_cnt?: number;
}
class ShopifyService {
  async syncShopifyOrdersToLuceed(
    shopifyOrders: Array<IShopifyOrder>,
    luceedOrders: Array<ILuceedOrder>,
    luceedProducts: Array<ILuceedProduct>,
    isDebug = true
  ): Promise<IShopifyOrderSyncStatus> {
    if (isDebug) {
      console.log(
        `Orders sync: Orders: [${shopifyOrders?.length}]: Luceed Orders: [${luceedOrders?.length}]: Luceed Products: [${luceedProducts?.length}]`
      );
    }

    if (!shopifyOrders) {
      return {};
    }
    let response: IShopifyOrderSyncStatus = {
      orders_created_cnt: 0,
      customers_created_cnt: 0,
    };
    for (let index = 0; index < shopifyOrders.length; index++) {
      const shopifyOrder = shopifyOrders[index];
      const orderName = shopifyOrdersService.getShopifyOrderName(shopifyOrder);

      /**
       * Save in local DB
       */
      const databaseData = {
        order_id: shopifyOrder.id,
        name: orderName,
        number: shopifyOrder.number,
        order_number: shopifyOrder.order_number,
        created_at: shopifyOrder.created_at
          ? new Date(shopifyOrder.created_at!)
          : undefined,
        confirmed: shopifyOrder.confirmed,
        fulfillment_status: shopifyOrder.fulfillment_status,
      };

      const databaseOrder = await orderService.touch(
        undefined,
        orderName,
        databaseData
      );
      const email = shopifyOrdersService.getShopifyOrderEmail(shopifyOrder);
      if (!email) {
        const error_message = `shopify order has no email: ${orderName}`;
        await statusService.storeErrorMessageAndThrowException(
          error_message,
          false
        );
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

      if (isDebug) {
        const percentage = Math.floor((index / shopifyOrders.length) * 100);
        console.log(
          `Orders synced: ${percentage}%: [${index}, ${shopifyOrders.length}]: ${orderName}`
        );
      }
    }
    return response;
  }

  async createLuceedOrder(
    shopifyOrder: IShopifyOrder,
    luceedProducts: Array<ILuceedProduct>
  ): Promise<string | undefined> {
    const orderName = shopifyOrdersService.getShopifyOrderName(shopifyOrder);

    await statusService.create({
      order_name: orderName,
    });

    /**
     * PARTNER
     */
    const luceedPartner = await this.touchLuceedCustomerFromShopifyOrder(
      shopifyOrder
    );
    if (!luceedPartner || !luceedPartner.partner_uid) {
      const error_message = `shopify order has no partner created: ${orderName}`;
      await statusService.storeErrorMessageAndThrowException(
        error_message,
        false
      );
      // return;
    }

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
      luceedPartner?.partner_uid,
      stavke,
      placanjeIznos,
      shopifyOrder.note
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
    const shopifyOrderItemDiscountPercentage =
      shopifyOrdersService.getShopifyOrderDiscountPercentage(shopifyOrder);
    for (const lineItems of shopifyOrder.line_items) {
      const luceedProduct = await luceedProductService.getLuceedProductBySKU(
        lineItems.sku,
        luceedProducts
      );
      if (!luceedProduct || !luceedProduct.artikl_uid) {
        const orderName =
          shopifyOrdersService.getShopifyOrderName(shopifyOrder);
        const error_message = `luceed product not found by SKU from shopify product in line item in order ${orderName}`;
        await statusService.storeErrorMessageAndThrowException(error_message);
      }
      const stavka: ILuceedCreateOrderProduct = {
        artikl_uid: luceedProduct!.artikl_uid!,
        cijena: luceedProduct!.mpc!,
        // cijena_s_porezom: "D",
        kolicina: lineItems.quantity, // TODO: Or currentQuanity?
        rabat: shopifyOrderItemDiscountPercentage,
      };
      stavke.push(stavka);
    }

    /**
     * Add delivery STAVKA to luceed NalogProdaje
     */
    const shippingStavka =
      shopifyOrdersService.getShopifyOrderLuceedStavkaForDelivery(shopifyOrder);
    if (shippingStavka) {
      stavke.push(shippingStavka);
    }

    return stavke;
  }

  /**
   * PLACANJE
   *
   * TODO: Confirm fields that contain correct total price of the Order.
   * Currently we use one of three fields.
   *
   * Luceed doesn't need total price,
   * but we send it anyways.
   */
  private async getLuceedPlacanjeIznosFromShopifyOrder(
    shopifyOrder: IShopifyOrder
  ): Promise<number | undefined> {
    if (!shopifyOrder) return undefined;

    const total_price =
      shopifyOrder.total_price ??
      shopifyOrder.total_outstanding ??
      shopifyOrder.current_total_price;

    if (total_price) {
      try {
        return Number.parseFloat(total_price);
      } catch (error) {
        //
      }
    }

    return undefined;
  }

  /**
   * TODO: Check
   *
   * Create Customer by email and shipping address
   * What if multiple partners returned? Get first one?
   *
   * TODO: Use shopifyOrder.customer.email
   * OR
   * shopifyOrder.email?
   */
  private async touchLuceedCustomerFromShopifyOrder(
    shopifyOrder: IShopifyOrder
  ): Promise<ILuceedCustomer | undefined> {
    const email = shopifyOrdersService.getShopifyOrderEmail(shopifyOrder);
    const shipping = shopifyOrdersService.getShopifyOrderShipping(shopifyOrder);
    /**
     * No email for customer - skip ORDER
     */
    if (!email) return undefined;

    /**
     * Fetch luceed customer
     * 1) by email
     * 2) then - filter by location
     *
     * If found, we have it already in Luceed...
     * If not, create new one in Luceed.
     */

    let luceedPartner = undefined;
    let luceedPartners = await luceedCustomerService.fetchCustomersByEmail(
      email
    );
    luceedPartners = luceedCustomerService.filterCustomersByEmailShipping(
      luceedPartners,
      email,
      shipping?.zip,
      luceedMjestoService.getShopifyOrderMjestoNaziv(shopifyOrder)
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
    const shipping = shopifyOrdersService.getShopifyOrderShipping(shopifyOrder);
    if (!email) return undefined;

    /**
     * General
     */
    const first_name = shipping?.first_name;
    const last_name = shipping?.last_name;
    const phone = shipping?.phone;
    /**
     * Location data
     */
    const locationZip = shipping?.zip;
    const locationAddress = `${shipping?.address1}, ${shipping?.address2},${shipping?.city}, ${shipping?.province}, ${locationZip}, ${shipping?.country}`;
    /**
     * Property `customer.adresa` has VARCHAR(200) type.
     * So, send only 200 max chars.
     */
    const locationAddressTrimmed = locationAddress.substring(0, 200);

    /**
     * Touch Mjesto
     */
    const luceedMjesto = await this.touchMjesto(
      shipping?.zip,
      luceedMjestoService.getShopifyOrderMjestoNaziv(shopifyOrder),
      shipping?.country
    );

    /**
     * Create Luceed Customer
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
      luceedMjesto?.mjesto_uid, // TODO: mjesto UID
      locationAddressTrimmed
    );

    /**
     * Fetch newly created Luceed customer, full object
     */
    if (!luceedCustomerId) return undefined;
    let luceedCustomers = await luceedCustomerService.fetchCustomersByEmail(
      email!
    );
    luceedCustomers = luceedCustomerService.filterCustomersByEmailShipping(
      luceedCustomers,
      email,
      shipping?.zip,
      luceedMjestoService.getShopifyOrderMjestoNaziv(shopifyOrder)
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

  /**
   * TODO:
   */
  async touchMjesto(
    zip?: string,
    cityName?: string,
    countryName?: string
  ): Promise<ILuceedMjesto | undefined> {
    if (!zip || !cityName) {
      return undefined;
    }
    /**
     * Fetch
     */
    let luceedMjesta = await luceedMjestoService.fetchMjesta(zip, cityName);
    if (luceedMjesta && luceedMjesta.length) {
      /**
       * Return first one
       */
      return luceedMjesta[0];
    } else {
      /**
       * TODO: Touch (Get or Create) country if needed (by countryName)
       *
       * Currently setting to Croatia.
       */
      const countryUid = config.luceed_partner_drzava_uid_default;
      if (!countryUid) {
        throw "cant get or create new country in luceed";
      }
      /**
       * Create
       */
      let luceedMjestoUid = await luceedMjestoService.createMjesto(
        zip,
        cityName,
        countryUid
      );
      if (luceedMjestoUid) {
        throw "cant create new mjesto in luceed";
      }
      luceedMjesta = await luceedMjestoService.fetchMjesta(zip, cityName);
      return luceedMjesta && luceedMjesta.length ? luceedMjesta[0] : undefined;
    }
  }
}

export default new ShopifyService();
