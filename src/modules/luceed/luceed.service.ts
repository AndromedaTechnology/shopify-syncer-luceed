import { ILuceedProduct } from "./luceedProduct.interface";
import luceedProductService from "./luceedProduct.service";
import luceedInventoryService from "./luceedInventory.service";
import { ILuceedInventoryItem } from "./luceedInventory.interface";

/**
 * Luceed
 */
class LuceedService {
  async findAll() {
    await this.fetchProductsWithInventory();

    return {
      msg: "Hello Luceed",
    };
  }

  async fetchProductsWithInventory(
    isDebug = true
  ): Promise<Array<ILuceedProduct>> {
    /**
     * Fetch Products
     */
    let products: Array<ILuceedProduct> = [];
    try {
      products = await luceedProductService.fetchProducts();
      if (isDebug) {
        luceedProductService.printProducts(products);
      }
    } catch (error) {
      throw error;
    }

    /**
     * Fetch Inventory
     */

    let inventoryItems: Array<ILuceedInventoryItem> = [];
    try {
      inventoryItems = await luceedInventoryService.fetchInventory();
    } catch (error) {
      throw error;
    }
    if (isDebug) {
      console.log(inventoryItems);
    }

    /**
     * Merge products and inventory
     */
    const merged: Array<ILuceedProduct> = this.mergeProductsWithInventory(
      products,
      inventoryItems
    );
    if (isDebug) {
      luceedProductService.printProducts(merged);
      console.log("LUCEED Products TOTAL", merged?.length);
    }

    return merged;
  }

  private mergeProductsWithInventory(
    products: Array<ILuceedProduct>,
    inventoryItems: Array<ILuceedInventoryItem>
  ): Array<ILuceedProduct> {
    products = products.map((product) => {
      const productInventoryItem = luceedInventoryService.getProductInventory(
        product,
        inventoryItems
      );
      return {
        ...product,
        raspolozivo: productInventoryItem?.raspolozivo,
        raspolozivo_kol: productInventoryItem?.raspolozivo_kol,
        stanje: productInventoryItem?.stanje,
        stanje_kol: productInventoryItem?.stanje_kol,
      };
    });
    return products;
  }
}

export default new LuceedService();
