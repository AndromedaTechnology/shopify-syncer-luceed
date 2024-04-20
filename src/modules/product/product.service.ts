import mongoose from "mongoose";
import productModel, { ProductDto } from "./product.model";

class ProductService {
  async touch(
    id?: mongoose.Types.ObjectId,
    variant_sku?: string,
    data?: ProductDto
  ): Promise<ProductDto> {
    let item = await this.find(id, variant_sku);
    if (!item && data) {
      /**
       * Default flags,
       * most permissive.
       */
      // data = {
      //   ...data,
      //   is_visible_in_webshop: true,
      //   is_buyable_only_in_physical_shop: false,
      // };
      item = await this.create(data);
    } else if (data) {
      item = await this.update(id, variant_sku, data);
    }
    return item;
  }

  private getFilter(
    id?: mongoose.Types.ObjectId,
    variant_sku?: string
  ): ProductDto {
    let filter: ProductDto = {};
    if (id) {
      filter._id = id;
    }
    if (variant_sku) {
      filter.variant_sku = variant_sku;
    }
    return filter;
  }
  async findAll(): Promise<Array<ProductDto>> {
    const items = await productModel.find();
    return items;
  }

  async find(
    id?: mongoose.Types.ObjectId,
    variant_sku?: string
  ): Promise<ProductDto> {
    const filter = this.getFilter(id, variant_sku);
    const item = await productModel.findOne(filter);
    return item;
  }

  async create(data: ProductDto): Promise<ProductDto> {
    const item = await productModel.create(data);
    return item;
  }

  async update(
    id?: mongoose.Types.ObjectId,
    variant_sku?: string,
    data?: ProductDto
  ): Promise<ProductDto> {
    const filter = this.getFilter(id, variant_sku);
    const item = await productModel.findOneAndUpdate(filter, data, {
      new: true,
    });
    return item;
  }

  async delete(
    id?: mongoose.Types.ObjectId,
    variant_sku?: string
  ): Promise<ProductDto> {
    const filter = this.getFilter(id, variant_sku);
    const item = await productModel.remove(filter);
    return item;
  }
}

export default new ProductService();
