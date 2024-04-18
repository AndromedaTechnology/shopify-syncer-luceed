import { ILuceedProduct } from "../interfaces/luceedProduct.interface";
import luceedProductService from "./luceedProduct.service";
import luceedInventoryService from "./luceedInventory.service";
import { ILuceedInventoryItem } from "../interfaces/luceedInventory.interface";
import shopifyInventoryService from "../../shopify/services/shopifyInventory.service";
import shopifyProductService, {
  IShopifySyncStatusProduct,
} from "../../shopify/services/shopifyProduct.service";
import { IShopifyProduct } from "../../shopify/interfaces/shopify.interface";
import config from "../../../config";
import shopifyLocationsService from "../../shopify/services/shopifyLocations.service";

export interface IShopifySyncStatusProducts {
  products_created_cnt?: number;
}

/**
 * Luceed
 *
 * Note about UID(s): UID= ID-SID.
 */
class LuceedService {
  public async syncLuceedShopifyProducts(
    luceedProducts: Array<ILuceedProduct>,
    isDebug = true
  ): Promise<IShopifySyncStatusProducts> {
    if (!luceedProducts || !luceedProducts.length) {
      throw "no luceed products to sync";
    }

    let productsStatus: IShopifySyncStatusProducts = {
      products_created_cnt: 0,
    };

    /**
     * Shopify Location Default
     */
    const locationDefault = await shopifyLocationsService.getLocation(
      config.shopify_shop_location_id
    );
    // console.log("--default-location", locationDefault);
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
      // console.log("--shopifyProducts", shopifyProducts.length);
    }

    /**
     * Loop luceed shopifyProducts
     */
    for (const luceedProduct of luceedProducts) {
      const productTitle = luceedProduct.naziv;
      const productVendor = luceedProduct.glavni_dobavljac_naziv;
      let productHandle = luceedProduct.artikl;
      /**
       * Remove leading zeroes
       */
      if (productHandle) {
        productHandle = luceedProductService.removeLeadingZeroes(productHandle);
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
      const productSyncStatus = await this.syncLuceedShopifyProduct(
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
      if (productSyncStatus.is_created) {
        productsStatus = {
          products_created_cnt: (productsStatus.products_created_cnt ?? 0) + 1,
        };
      }
    }

    return productsStatus;
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
  ): Promise<IShopifySyncStatusProduct> {
    let response: IShopifySyncStatusProduct = {
      product: undefined,
      is_created: false,
    };
    /**
     * TODO: Remove prefixes (000?)
     */
    let product = shopifyProductService.getProductByHandle(
      products,
      productHandle
    );
    if (isDebug) {
      // console.log("--product", productHandle, product);
    }

    /**
     * Touch product
     */
    response = await shopifyProductService.touchProduct(
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
      product!,
      locationDefaultId,
      productAmount,
      isDebug
    );

    if (isDebug) {
      // console.log(
      //   "--set-inventory-level-" + locationDefaultId,
      //   productAmount,
      //   inventoryLevel
      // );
    }
    return response;
  }
}

export default new LuceedService();
