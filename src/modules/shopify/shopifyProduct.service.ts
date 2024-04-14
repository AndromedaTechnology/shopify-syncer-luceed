import axios from "axios";

import config from "../../config";
import { limiter } from "../root/root.service";

import {
  IShopifyProduct,
  IShopifyProductVariant,
  IShopifyProductsResponse,
  IShopifyProductCreateResponse,
  IShopifyProductVariantsResponse,
} from "./shopify.interface";
import shopifyHelper from "./shopify.helper";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

class ShopifyProductService {
  async findAll(isDebug = true) {
    // await this.fetchProducts("8463331983593");
    // await this.fetchProductVariants("8463331983593");
    // const productByHandle = await this.fetchProductByHandle("handle-001");
    // console.warn("product-handle-result", productByHandle);

    return {
      msg: "Hello Shopify",
    };
  }

  async getOrFetchProductVariant(
    product: IShopifyProduct
  ): Promise<IShopifyProductVariant | undefined> {
    if (!product || !product.id) {
      return undefined;
    }
    let variant = this.getProductVariant(product);
    if (!variant || !variant.id) {
      const variants = await this.fetchProductVariants(product.id);
      if (!variants || !variants.length) {
        throw "product fetch variants - returned nothing";
      }
      // We return only first one. As more we shouldn't have
      variant = variants[0];
    }
    return variant;
  }

  getProductVariant(
    product: IShopifyProduct
  ): IShopifyProductVariant | undefined {
    return product.variants && product.variants.length
      ? product.variants[0]
      : undefined;
  }

  /**
   * TODO: Remove prefixes (000?)
   */
  getProductByHandle(
    products: Array<IShopifyProduct>,
    handle: string
  ): IShopifyProduct | undefined {
    if (!handle) {
      throw "handle needed";
    }
    return products?.find((product) => product.handle === handle);
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
      throw "handle sku price required";
    }

    /**
     * Add handle, sku
     */
    data = {
      ...data,
      handle: productHandle,
      variants: [
        {
          sku: productSKU,
          inventory_management: "shopify",
          price: productPrice,
        },
      ],
    };

    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/products.json`;
    let response: IShopifyProductCreateResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
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
        console.log("--create-product-" + data, response);
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
    productId: string,
    productHandle: string,
    variantId: number,
    variantSKU: string,
    variantPrice: string,
    data: IShopifyProduct,
    isDebug = true
  ): Promise<IShopifyProduct | undefined> {
    if (!productId || !productHandle) {
      throw "productId productHandle required";
    }
    if (!variantId || !variantSKU || !variantPrice) {
      throw "handle sku price required";
    }
    if (!data) {
      throw "data required";
    }
    // if (!data.variants || !data.variants.length) {
    //   throw "variant.length > 0 required";
    // }

    /**
     * Add handle, sku
     */
    data = {
      ...data,
      handle: productHandle,
      variants: [
        {
          id: variantId,
          sku: variantSKU,
          price: variantPrice,
          inventory_management: "shopify",
        },
      ],
    };

    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/products/${productId}.json`;
    let response: IShopifyProductCreateResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
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
        console.log("--update-product-" + data, response);
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
      console.log(
        "--products-",
        productIds
        // response,
        // response?.products,
      );
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

  /**
   * With Pagination
   * - TODO: Check if it works.
   */
  async fetchProductVariants(
    productId: string,
    paginationLimit = 250,
    urlParam?: string,
    isDebug = true
  ): Promise<Array<IShopifyProductVariant>> {
    var url;
    if (urlParam) {
      url = urlParam;
    } else {
      url = `https://${shopName}.myshopify.com/admin/api/2024-01/products/${productId}/variants.json`;
      if (paginationLimit) {
        if (true) {
          url += "?";
        } else {
          url += "&";
        }
        url += `limit=${paginationLimit}`;
      }
    }
    let response: IShopifyProductVariantsResponse | undefined = undefined;
    let responseHeaders: any;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        method: "get",
        url: url,
        // data: reqData,

        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
      response = axiosResponse?.data;
      responseHeaders = axiosResponse?.headers;
    } catch (error) {
      console.log(error);
      throw error;
    }
    console.log("--product-variants-" + productId, response);
    let variants = response?.variants ?? [];
    const nextLink =
      shopifyHelper.shopifyResponseHeaderGetNextLink(responseHeaders);
    if (nextLink) {
      const childVariants = await this.fetchProductVariants(
        productId,
        paginationLimit,
        nextLink
      );
      variants = [...variants, ...childVariants];
    }
    return variants ?? [];
  }
}

export default new ShopifyProductService();
