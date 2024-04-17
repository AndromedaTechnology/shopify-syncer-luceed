import config from "../../../config";

import { IShopifyProduct } from "../interfaces/shopify.interface";
import shopifyProductService from "./shopifyProduct.service";
import shopifyLocationsService from "./shopifyLocations.service";
import shopifyInventoryService from "./shopifyInventory.service";
import { ILuceedProduct } from "../../luceed/interfaces/luceedProduct.interface";

class ShopifyService {
  public async syncLuceedShopifyProducts(
    luceedProducts: Array<ILuceedProduct>,
    isDebug = true
  ) {
    if (!luceedProducts || !luceedProducts.length) {
      throw "no luceed products to sync";
    }

    /**
     * Shopify Location Default
     */
    const locationDefault = await shopifyLocationsService.getLocation(
      config.shopify_shop_location_id
    );
    console.log("--default-location", locationDefault);
    if (!locationDefault || !locationDefault.id) {
      throw "default location not available";
    }

    /**
     * Shopify Products
     */
    const shopifyProducts: Array<IShopifyProduct> =
      await shopifyProductService.fetchProducts(
        undefined,
        undefined,
        250,
        true
      );
    if (isDebug) {
      console.log("--shopifyProducts", shopifyProducts.length);
    }

    /**
     * Loop luceed shopifyProducts
     */
    for (const luceedProduct of luceedProducts) {
      const productTitle = luceedProduct.naziv;
      const productVendor = luceedProduct.glavni_dobavljac_naziv;
      let productHandle = luceedProduct.artikl;
      /**
       * TODO: Refactor
       * Remove leading zeroes
       */
      if (productHandle) {
        const productHandleInt = parseInt(productHandle);
        productHandle = productHandleInt.toString();
      }
      const productAmount = luceedProduct.raspolozivo_kol ?? 0;
      // console.log("productHandle", productHandle);
      // break;
      /**
       * TODO: Price: 2 or 3 decimal points
       */
      const productPrice = luceedProduct.mpc?.toString() ?? "0.00";

      /**
       * TODO: undefined - returned by luceed?
       */
      if (productAmount === undefined) continue;
      if (!productTitle) continue;
      if (!productHandle) continue;
      if (!productVendor) continue;

      /**
       * Sync
       */
      await this.syncLuceedShopifyProduct(
        shopifyProducts,
        productHandle!,
        productTitle!,
        productVendor!,
        productPrice,
        /**
         * TODO: We floor (not to send decimal to Shopify)
         * TODO: Support decimal for meat etc.
         */
        Math.floor(productAmount),
        locationDefault?.id!
      );
    }
  }

  private async syncLuceedShopifyProduct(
    products: Array<IShopifyProduct>,
    productHandle: string,
    productTitle: string,
    productVendor: string,
    productPrice: string,
    productAmount: number,
    locationDefaultId: number,
    isDebug = true
  ): Promise<IShopifyProduct> {
    /**
     * TODO: Remove prefixes (000?)
     */
    let product = shopifyProductService.getProductByHandle(
      products,
      productHandle
    );
    if (isDebug) {
      console.log("--product", productHandle, product);
    }

    /**
     * Touch product
     */
    product = await shopifyProductService.touchProduct(
      product,
      productHandle,
      productTitle,
      productVendor,
      productPrice,
      isDebug
    );

    /**
     * Something went wrong.
     * Product to available before, and not created now.
     * Break.
     */
    if (!product) {
      throw "product not found before, and not created - so can't continue";
    }

    /**
     * Set inventory
     */
    const inventoryLevel = await shopifyInventoryService.setProductInventory(
      product,
      locationDefaultId,
      productAmount,
      isDebug
    );

    if (isDebug) {
      console.log(
        "--set-inventory-level-" + locationDefaultId,
        productAmount,
        inventoryLevel
      );
    }
    return product;
  }
}

export default new ShopifyService();
