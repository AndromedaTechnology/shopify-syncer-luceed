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

class ShopifyService {
  async syncShopifyOrdersToLuceed(
    shopifyOrders: Array<IShopifyOrder>,
    luceedOrders: Array<ILuceedOrder>,
    luceedProducts: Array<ILuceedProduct>
  ) {
    if (!shopifyOrders) return;
    for (const shopifyOrder of shopifyOrders) {
      const luceedOrder = this.getLuceedOrderByShopifyOrderId(
        shopifyOrder.name,
        luceedOrders
      );
      if (!luceedOrder) {
        const luceedOrderId = await this.createLuceedOrder(
          shopifyOrder,
          luceedProducts
        );
      }
      return;
    }
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
      shopifyOrder.name,
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
      const luceedProduct = this.getLuceedProductBySKU(
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
   * TODO: Check
   *
   * Convert SKU properly and compare
   */
  private getLuceedProductBySKU(
    sku: string,
    luceedProducts: Array<ILuceedProduct>
  ): ILuceedProduct | undefined {
    const skuWithoutPrefixedZeroes =
      luceedProductService.removeLeadingZeroes(sku);
    return luceedProducts.find((luceedProduct) => {
      if (!luceedProduct.artikl) return false;
      const artiklSKU = luceedProductService.removeLeadingZeroes(
        luceedProduct.artikl
      );
      return artiklSKU === skuWithoutPrefixedZeroes;
    });
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
    const email = this.getShopifyOrderEmail(shopifyOrder);
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
  getShopifyOrderEmail(shopifyOrder: IShopifyOrder): string | undefined {
    const email =
      shopifyOrder.email ??
      shopifyOrder.contact_email ??
      shopifyOrder.customer?.email ??
      undefined;
    return email;
  }

  /**
   * TODO: Check
   */
  private async createLuceedCustomerFromShopifyOrder(
    shopifyOrder: IShopifyOrder
  ): Promise<ILuceedCustomer | undefined> {
    const email = this.getShopifyOrderEmail(shopifyOrder);

    if (!email) return undefined;
    if (!shopifyOrder.customer) return undefined;
    const luceedCustomerId = await luceedCustomerService.createCustomer(
      shopifyOrder.customer!.first_name,
      shopifyOrder.customer!.last_name,
      shopifyOrder.customer!.phone,
      shopifyOrder.customer!.phone,
      email
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
