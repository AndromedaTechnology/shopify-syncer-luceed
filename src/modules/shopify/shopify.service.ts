import config from "../../config";
import axios from "axios";
import {
  IShopifyProduct,
  IShopifyProductCreateResponse,
  IShopifyProductVariant,
  IShopifyProductsResponse,
} from "./shopify.interface";
import shopifyLocationsService from "./shopifyLocations.service";
import shopifyInventoryService from "./shopifyInventory.service";
import { ILuceedProduct } from "../root/luceed.interface";
import { limiter } from "../root/root.service";
import shopifyHelper from "./shopify.helper";

const shopName = config.shopify_shop_name;
const accessToken = config.shopify_access_token;

class ShopifyService {
  async findAll(isDebug = true) {
    // await this.fetchProducts("8463331983593");
    // await this.fetchProductVariants("8463331983593");
    // const productByHandle = await this.fetchProductByHandle("handle-001");
    // console.warn("product-handle-result", productByHandle);

    return {
      msg: "Hello Shopify",
    };
  }

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
    const shopifyProducts: Array<IShopifyProduct> = await this.fetchProducts(
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
    let product = this.getProductByHandle(products, productHandle);
    if (isDebug) {
      console.log("--product", productHandle, product);
    }

    if (!product) {
      const productCreated = await this.createProduct(
        productHandle,
        productHandle,
        productPrice,
        {
          title: productTitle,
          handle: productHandle,
          vendor: productVendor,
        },
        false
      );
      product = productCreated;
      if (isDebug) {
        console.log("--productCreated", productCreated);
      }
    }

    /**
     * Something went wrong.
     * Product to available before, and not created now.
     * Break.
     */
    if (!product) {
      throw "product not found before, and not created - so can't continue";
    }

    const productVariant = this.getProductVariant(product!);
    const productVariantInventoryItemId = productVariant?.inventory_item_id;
    if (isDebug) {
      console.log(
        "--product-variant",
        productVariant,
        productVariantInventoryItemId
      );
    }
    if (!productVariantInventoryItemId) {
      throw "productVariantInventoryItemId not found, so can't continue";
    }

    const inventoryLevel =
      await shopifyInventoryService.setLevelsPerItemPerLocation(
        locationDefaultId,
        productVariantInventoryItemId,
        productAmount,
        true,
        true
      );
    if (!inventoryLevel) {
      throw "inventory level not set";
    }
    if (isDebug) {
      console.log(
        "--set-inventory-level-" + locationDefaultId,
        productVariantInventoryItemId,
        productAmount,
        inventoryLevel
      );
    }
    return product;
  }

  private getProductVariant(
    product: IShopifyProduct
  ): IShopifyProductVariant | undefined {
    return product.variants && product.variants.length
      ? product.variants[0]
      : undefined;
  }

  /**
   * TODO: Remove prefixes (000?)
   */
  private getProductByHandle(
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
    if (!productHandle || !productSKU) {
      throw "handle sku required";
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
   * Get [InventoryItems and Levels]
   * per Location
   *
   * TODO: Paginate
   */
  async fetchProductVariants(productId: string) {
    var url = `https://${shopName}.myshopify.com/admin/api/2024-01/products/${productId}/variants.json`;
    let response;
    try {
      const remainingRequests = await limiter.removeTokens(1);
      response = await axios({
        method: "get",
        url: url,
        // data: reqData,

        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
    } catch (error) {
      console.log(error);
    }
    console.log("--product-variants-" + productId, response?.data);
    return response?.data;
  }
}

export default new ShopifyService();
