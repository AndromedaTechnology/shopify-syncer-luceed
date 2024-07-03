import axios from "axios";

import config from "../../../config";
import { limiter } from "../../root/root.service";

import {
  IShopifyCreateProductVariantResponse,
  IShopifyProduct,
  IShopifyProductVariant,
  IShopifyProductVariantsResponse,
  ShopifyProductVariantInventoryPolicy,
} from "../interfaces/shopify.interface";
import shopifyHelper from "../helpers/shopify.helper";
import { AxiosProxyHelper } from "../../../helpers/axiosProxy.helper";
import statusService from "../../status/status.service";

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
        const error_message = "product fetch variants - returned nothing";
        await statusService.storeErrorMessageAndThrowException(error_message);
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
        // proxy: AxiosProxyHelper.getProxy(),
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

  getVariantPriceWithPercentage(
    originalProductVariantPrice: string,
    discountPercentage: string
  ): string {
    try {
      let originalPrice = Number.parseFloat(originalProductVariantPrice);
      let percentage = Number.parseFloat(discountPercentage);

      const percentageDecimal = percentage / 100; // 0.10
      const percentPart = originalPrice * percentageDecimal;
      let value: string = (originalPrice - percentPart).toFixed(2);
      return value;
    } catch (error) {
      return originalProductVariantPrice;
    }
  }

  /**
   *
   */
  getVariantPricesIfShopWideDiscount(originalProductVariantPrice: string): {
    price?: string;
    compare_at_price?: string;
  } {
    let discountPercentage: string | null =
      config.shopify_shopwide_discount_percent ?? "0";

    if (!discountPercentage || discountPercentage === "0") {
      discountPercentage = null;
    }

    if (!discountPercentage) {
      return {
        price: originalProductVariantPrice,
      };
    } else {
      const newPrice = this.getVariantPriceWithPercentage(
        originalProductVariantPrice,
        discountPercentage
      );
      if (newPrice !== originalProductVariantPrice) {
        return {
          price: newPrice,
          compare_at_price: originalProductVariantPrice,
        };
      } else {
        return {
          price: originalProductVariantPrice,
        };
      }
    }
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
      const error_message = "productId required";
      await statusService.storeErrorMessageAndThrowException(error_message);
    }

    const { price, compare_at_price } =
      this.getVariantPricesIfShopWideDiscount(productVariantPrice);

    data = {
      ...data,
      sku: productVariantSKU,
      price: price,
      compare_at_price: compare_at_price,
      inventory_management: "shopify",
      requires_shipping: true,
      inventory_policy: ShopifyProductVariantInventoryPolicy.CONTINUE,
    };

    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/products/${productId}/variants.json`;
    let response: IShopifyCreateProductVariantResponse | undefined = undefined;
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
