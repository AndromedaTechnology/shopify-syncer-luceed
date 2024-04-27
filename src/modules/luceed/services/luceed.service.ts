import config from "../../../config";
import shopifyProductService, {
  IShopifySyncStatusProduct,
} from "../../shopify/services/shopifyProduct.service";
import productService from "../../product/product.service";
import luceedProductService from "./luceedProduct.service";
import { ILuceedProduct } from "../interfaces/luceedProduct.interface";
import {
  IShopifyProduct,
  IShopifyProductStatus,
} from "../../shopify/interfaces/shopify.interface";
import shopifyInventoryService from "../../shopify/services/shopifyInventory.service";
import shopifyLocationsService from "../../shopify/services/shopifyLocations.service";
import statusService from "../../status/status.service";

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
      const error_message = "no luceed products to sync";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }

    let productsStatus: IShopifySyncStatusProducts = {
      products_created_cnt: 0,
    };

    /**
     * Shopify Location Default
     */
    const locationWebshop = await shopifyLocationsService.getLocation(
      config.shopify_webshop_location_id
    );
    const locationShop = await shopifyLocationsService.getLocation(
      config.shopify_shop_location_id
    );
    if (!locationWebshop || !locationWebshop.id) {
      const error_message = "webshop location not available";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }
    if (!locationShop || !locationShop.id) {
      const error_message = "physical shop location not available";
      await statusService.storeErrorMessageAndThrowException(error_message);
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
    for (let index = 0; index < luceedProducts.length; index++) {
      const luceedProduct = luceedProducts[index];
      /**
       * Get data
       */
      let productSKU = luceedProduct.artikl;
      const productTitle = luceedProduct.naziv;
      const productVendor = luceedProduct.glavni_dobavljac_naziv;
      const productAmount =
        luceedProductService.getProductAvailableCnt(luceedProduct);
      const productPrice = luceedProductService.getProductMPC(luceedProduct);
      const productCost = luceedProductService.getProductCost(luceedProduct);
      productSKU = productSKU
        ? await luceedProductService.removeSKUPrefix(productSKU)
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
        productCost,
        productAmount,
        locationWebshop?.id!,
        locationShop?.id!
      );

      if (isDebug) {
        const percentage = Math.floor((index / luceedProducts.length) * 100);
        console.log(
          `Products synced: ${percentage}%: [${index}, ${luceedProducts.length}]: ${productSKU}: ${productTitle}`
        );
      }

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
    productCost: string,
    productAmount: number,
    locationWebshopId: number,
    locationShopId: number,
    isDebug = true
  ): Promise<IShopifySyncStatusProduct> {
    await statusService.create({
      product_variant_sku: productSKU,
    });

    let response: IShopifySyncStatusProduct = {
      product: undefined,
      is_created: false,
    };

    productSKU = await luceedProductService.removeSKUPrefix(productSKU);
    let product = await shopifyProductService.getProductBySKU(
      products,
      productSKU
    );

    /**
     * Touch product
     */
    const databaseProductExisting = await productService.find(
      undefined,
      productSKU
    );
    let databaseProduct = await productService.touch(undefined, productSKU, {
      handle: productSKU,
      title: productTitle ?? productSKU,
      vendor: productVendor,
      variant_sku: productSKU,
      variant_price: productPrice,
      variant_inventory_item_cost: productCost,
      /**
       * We already have some flags = TRUE, so we leave it be.
       */
      is_buyable_only_in_physical_shop:
        databaseProductExisting?.is_buyable_only_in_physical_shop ?? false,
      /**
       * Set DB value (local) to value from Shopify
       */
      is_visible_in_webshop:
        product?.status === IShopifyProductStatus.ACTIVE ? true : false,
    });
    response = await shopifyProductService.touchProduct(
      product,
      productSKU,
      productTitle,
      productVendor,
      productPrice,
      databaseProduct.is_visible_in_webshop ?? false,
      isDebug
    );
    const shopifyProduct: IShopifyProduct | undefined = response.product;
    databaseProduct = await productService.update(undefined, productSKU, {
      shopify_product_id: shopifyProduct?.id,
    });

    /**
     * Taking newly touched product, from Shopify.
     */
    product = shopifyProduct;
    if (!product) {
      const error_message =
        "product not found before, and not created - so can't continue";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }

    /**
     * Set inventory
     */
    const inventoryLevel = await shopifyInventoryService.setProductInventory(
      product!,
      locationWebshopId,
      locationShopId,
      productAmount,
      productCost,
      databaseProduct.is_buyable_only_in_physical_shop ?? false,
      isDebug
    );

    return response;
  }
}

export default new LuceedService();
