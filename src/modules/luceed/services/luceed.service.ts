import config from "../../../config";
import shopifyProductService, {
  IShopifySyncStatusProduct,
} from "../../shopify/services/shopifyProduct.service";
import productService from "../../product/product.service";
import luceedProductService from "./luceedProduct.service";
import { ILuceedProduct } from "../interfaces/luceedProduct.interface";
import { IShopifyProduct } from "../../shopify/interfaces/shopify.interface";
import shopifyInventoryService from "../../shopify/services/shopifyInventory.service";
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

    /**
     * Loop luceed shopifyProducts
     */
    for (const luceedProduct of luceedProducts) {
      /**
       * Get data
       */
      let productSKU = luceedProduct.artikl;
      const productTitle = luceedProduct.naziv;
      const productVendor = luceedProduct.glavni_dobavljac_naziv;
      const productAmount =
        luceedProductService.getProductAvailableCnt(luceedProduct);
      const productPrice = luceedProductService.getProductMPC(luceedProduct);
      productSKU = productSKU
        ? luceedProductService.removeSKUPrefix(productSKU)
        : undefined;

      if (!productSKU) continue;
      if (!productTitle) continue;
      if (!productVendor) continue;
      if (productAmount === undefined) continue;

      /**
       * Sync
       */
      const productSyncStatus = await this.syncLuceedShopifyProduct(
        shopifyProducts,
        productSKU!,
        productTitle!,
        productVendor!,
        productPrice,
        productAmount,
        locationDefault?.id!
      );

      /**
       * Add to stats
       */
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
    productSKU: string,
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

    productSKU = luceedProductService.removeSKUPrefix(productSKU);
    let product = shopifyProductService.getProductByHandle(
      products,
      productSKU
    );

    /**
     * Touch product
     */
    const databaseProduct = await productService.touch(undefined, productSKU, {
      handle: productSKU,
      title: productSKU,
      vendor: productVendor,
      variant_sku: productSKU,
      variant_price: productPrice,
    });
    response = await shopifyProductService.touchProduct(
      product,
      productSKU,
      productTitle,
      productVendor,
      productPrice,
      isDebug
    );
    const shopifyProduct: IShopifyProduct | undefined = response.product;
    await productService.update(undefined, productSKU, {
      shopify_product_id: shopifyProduct?.id,
    });

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

    return response;
  }
}

export default new LuceedService();
