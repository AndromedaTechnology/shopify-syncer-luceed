import axios from "axios";

import config from "../../config";
import { limiter } from "../root/root.service";

import {
  IShopifyProduct,
  IShopifyProductVariant,
  IShopifyProductVariantsResponse,
} from "./shopify.interface";
import shopifyHelper from "./shopify.helper";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

class ShopifyProductVariantService {
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

export default new ShopifyProductVariantService();
