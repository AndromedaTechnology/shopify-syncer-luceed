import axios from "axios";

import config from "../../../config";
import { limiter } from "../../root/root.service";

import {
  IShopifyCreateProductVariantResponse,
  IShopifyProduct,
  IShopifyProductVariant,
  IShopifyProductVariantsResponse,
} from "../interfaces/shopify.interface";
import shopifyHelper from "../helpers/shopify.helper";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

class ShopifyProductVariantService {
  async touchProductVariant(
    product: IShopifyProduct,
    productVariantSKU: string,
    productVariantPrice: string,
    isDebug = true
  ): Promise<IShopifyProductVariant | undefined> {
    if (!product || !product.id) {
      return undefined;
    }
    let variant = await this.getOrFetchProductVariant(product);
    /**
     * Create default product variant
     */
    if (!variant) {
      variant = await this.createProductVariant(
        product.id,
        productVariantSKU,
        productVariantPrice,
        undefined,
        isDebug
      );
    }
    return variant;
  }

  private async getOrFetchProductVariant(
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
   * With Pagination
   * - TODO: Check if it works.
   */
  async fetchProductVariants(
    productId: number,
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
        proxy: AxiosProxyHelper.getProxy(),
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
    // console.log("--product-variants-" + productId, response);
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

  /**
   * Create new product
   * with default variant
   *
   */
  async createProductVariant(
    productId: number,
    productVariantSKU: string,
    productVariantPrice: string,
    data?: IShopifyProductVariant,
    isDebug = true
  ): Promise<IShopifyProductVariant | undefined> {
    if (!productId || !productVariantSKU || !productVariantPrice) {
      throw "productId required";
    }

    data = {
      ...data,
      sku: productVariantSKU,
      price: productVariantPrice,
      inventory_management: "shopify",
    };

    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/products/${productId}/variants.json`;
    let response: IShopifyCreateProductVariantResponse | undefined = undefined;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      const axiosResponse = await axios({
        proxy: AxiosProxyHelper.getProxy(),
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
        // console.log("--create-productVariant-" + data, response);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response?.variant;
  }
}

export default new ShopifyProductVariantService();
