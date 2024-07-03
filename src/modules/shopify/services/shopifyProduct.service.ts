import axios from "axios";

import config from "../../../config";
import { limiter } from "../../root/root.service";

import {
  IShopifyProduct,
  IShopifyProductsResponse,
  IShopifyProductCreateResponse,
  IShopifyProductStatus,
  ShopifyProductVariantInventoryPolicy,
} from "../interfaces/shopify.interface";
import shopifyHelper from "../helpers/shopify.helper";
import shopifyProductVariantService from "./shopifyProductVariant.service";
import luceedProductService from "../../luceed/services/luceedProduct.service";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";
import statusService from "../../status/status.service";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

export interface IShopifySyncStatusProduct {
  is_created?: boolean;
  product?: IShopifyProduct;
}

class ShopifyProductService {
  /**
   * Create or Update product
   * Make sure it exists.
   */
  async touchProduct(
    product: IShopifyProduct | undefined,
    productHandle: string,
    productTitle: string,
    productVendor: string,
    productPrice: string,
    is_visible_in_webshop: boolean,
    isDebug = true
  ): Promise<IShopifySyncStatusProduct> {
    let response: IShopifySyncStatusProduct = {
      is_created: false,
      product: undefined,
    };

    if (product && product!.id) {
      /**
       * Update Product
       * TODO: Test!
       *
       * Variant needs to have ID defined on it, when updating!
       * So, get default product variant ID,
       * and then set it here (as variant.id, to know which variant to update).
       */
      const productId = product!.id;
      const variant = await shopifyProductVariantService.touchProductVariant(
        product!,
        productHandle,
        productPrice,
        isDebug
      );

      if (!variant || !variant!.id) {
        const error_message = "product exists, but variant doesnt";
        await statusService.storeErrorMessageAndThrowException(error_message);
        /**
         * Then create default Variant and attach to product
         * TODO: Test if variant is created/getted/fetched(touched) and everything passes
         */
      }
      const productUpdated = await this.updateProduct(
        productId!,
        productHandle,
        variant!.id!,
        productHandle,
        productPrice,
        {
          title: productTitle,
          handle: productHandle,
          vendor: productVendor,
          status: is_visible_in_webshop
            ? IShopifyProductStatus.ACTIVE
            : IShopifyProductStatus.DRAFT,
        },
        false
      );
      product = productUpdated;
      if (isDebug) {
        // console.log("--productUpdated", productUpdated);
      }
    } else if (!product) {
      /**
       * Create
       */
      const productCreated = await this.createProduct(
        productHandle,
        productHandle,
        productPrice,
        {
          title: productTitle,
          handle: productHandle,
          vendor: productVendor,
          status: is_visible_in_webshop
            ? IShopifyProductStatus.ACTIVE
            : IShopifyProductStatus.DRAFT,
        },
        false
      );
      product = productCreated;

      response = {
        ...response,
        is_created: true,
      };
      if (isDebug) {
        // console.log("--productCreated", productCreated);
      }
    }
    response = {
      ...response,
      product: product,
    };
    return response;
  }

  /**
   * Remove prefixes (000*)
   *
   * Here it is required, and provided by Shopify,
   * that each product has variants returned.
   *
   * In these variants, on the product,
   * we have SKU, which we search for.
   *
   * Handle on product is not okay,
   * as this is URL parameter on webshop,
   * used for display purposes and indexing.
   *
   * SKU is for real comparison in internal apps and tracking.
   */
  async getProductBySKU(
    products: Array<IShopifyProduct>,
    productSKU: string
  ): Promise<IShopifyProduct | undefined> {
    if (!productSKU) {
      const error_message = "productSKU needed";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }
    productSKU = await luceedProductService.removeSKUPrefix(productSKU);

    let item: IShopifyProduct | undefined = undefined;
    for (const product of products ?? []) {
      for (const variant of product.variants ?? []) {
        let isFound =
          (await luceedProductService.removeSKUPrefix(variant.sku)) ===
          productSKU;
        if (isFound) {
          item = product;
          break;
        }
      }
      if (item) {
        break;
      }
    }
    return item;
  }

  /**
   * Create new product
   * with default variant
   *
   */
  async createProduct(
    productHandle: string,
    productSKU: string,
    productPrice: string,
    data: IShopifyProduct,
    isDebug = true
  ): Promise<IShopifyProduct | undefined> {
    if (!productHandle || !productSKU || !productPrice) {
      const error_message = "handle sku price required";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }

    const { price, compare_at_price } =
      shopifyProductVariantService.getVariantPricesIfShopWideDiscount(
        productPrice
      );

    /**
     * Add handle, sku
     */
    data = {
      ...data,
      handle: productHandle,
      status: data.status,
      variants: [
        {
          sku: productSKU,
          requires_shipping: true,
          inventory_management: "shopify",
          inventory_policy: ShopifyProductVariantInventoryPolicy.CONTINUE,
          price: price,
          compare_at_price: compare_at_price,
        },
      ],
    };

    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/products.json`;
    let response: IShopifyProductCreateResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        // proxy: AxiosProxyHelper.getProxy(),
        method: "post",
        url: url,
        data: {
          product: data,
        },

        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
      if (isDebug) {
        // console.log("--create-product-" + data, response);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response?.product;
  }

  /**
   * TODO: TEST!
   * TODO: Variant needs to have ID defined on it, when updating!
   * So, get default product variant ID,
   * and then set it here (as variant.id, to know which variant to update).
   *
   * Update product
   * and default variant
   *
   * @prop productId needs to be fetched before
   * @prop variantId needs to be fetched before.
   * @prop variantId we have only 1 variant per product (default one), always.
   */
  async updateProduct(
    productId: number,
    productHandle: string,
    variantId: number,
    variantSKU: string,
    variantPrice: string,
    data: IShopifyProduct,
    isDebug = true
  ): Promise<IShopifyProduct | undefined> {
    if (!productId || !productHandle) {
      const error_message = "productId productHandle required";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }
    if (!variantId || !variantSKU || !variantPrice) {
      const error_message = "handle sku price required";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }
    if (!data) {
      const error_message = "data required";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }
    // if (!data.variants || !data.variants.length) {
    //   throw "variant.length > 0 required";
    // }

    const { price, compare_at_price } =
      shopifyProductVariantService.getVariantPricesIfShopWideDiscount(
        variantPrice
      );

    /**
     * Add handle, sku
     */
    data = {
      ...data,
      handle: productHandle,
      status: data.status,
      variants: [
        {
          id: variantId,
          sku: variantSKU,
          price: price,
          compare_at_price: compare_at_price,
          requires_shipping: true,
          inventory_management: "shopify",
          inventory_policy: ShopifyProductVariantInventoryPolicy.CONTINUE,
        },
      ],
    };

    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/products/${productId}.json`;
    let response: IShopifyProductCreateResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        // proxy: AxiosProxyHelper.getProxy(),
        method: "put",
        url: url,
        data: {
          product: data,
        },
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
      if (isDebug) {
        // console.log("--update-product-" + data, response);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response?.product;
  }

  /**
   * @param {string} productIds comma separated string list
   */
  async fetchProducts(
    productIds?: string,
    handlesCommaSeparated?: string,
    paginationLimit = 250,
    isDebug = true,
    urlParam?: string
  ): Promise<Array<IShopifyProduct>> {
    var url;
    if (urlParam) {
      url = urlParam;
    } else {
      url = `https://${shopName}.myshopify.com/admin/api/2024-01/products.json`;
      if (productIds) {
        url += "?";
        url += `ids=${productIds}`;
      }
      if (handlesCommaSeparated) {
        if (!productIds) {
          url += "?";
        } else {
          url += "&";
        }
        url += `handle=${handlesCommaSeparated}`;
      }

      if (paginationLimit) {
        if (!productIds && !handlesCommaSeparated) {
          url += "?";
        } else {
          url += "&";
        }
        url += `limit=${paginationLimit}`;
      }
    }

    let response: IShopifyProductsResponse | undefined = undefined;
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
    } catch (error) {
      if (isDebug) {
        console.log(error);
      }
      throw error;
    }
    if (isDebug) {
      // console.log(
      //   "--products-",
      //   productIds
      //   // response,
      //   // response?.products,
      // );
    }

    let products = response?.products ?? [];
    const nextLink =
      shopifyHelper.shopifyResponseHeaderGetNextLink(responseHeaders);
    if (nextLink) {
      const childProducts = await this.fetchProducts(
        undefined,
        undefined,
        undefined,
        undefined,
        nextLink
      );
      products = [...products, ...childProducts];
    }
    return products ?? [];
  }
}

export default new ShopifyProductService();
