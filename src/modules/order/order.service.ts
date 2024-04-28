import mongoose from "mongoose";
import orderModel, { OrderDto } from "./order.model";

class OrderService {
  async touch(
    id?: mongoose.Types.ObjectId,
    name?: string,
    data?: OrderDto
  ): Promise<OrderDto> {
    let item = await this.find(id, name);
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
      item = await this.create(data!);
    } else if (data) {
      item = await this.update(id, name, data);
    }
    return item;
  }

  private getFilter(id?: mongoose.Types.ObjectId, name?: string): OrderDto {
    let filter: OrderDto = {};
    if (id) {
      filter._id = id;
    }
    if (name) {
      filter.name = name;
    }
    return filter;
  }
  async findAll(): Promise<Array<OrderDto>> {
    const items = await orderModel.find();
    return items;
  }

  async find(id?: mongoose.Types.ObjectId, name?: string): Promise<OrderDto> {
    const filter = this.getFilter(id, name);
    const item = await orderModel.findOne(filter);
    return item;
  }

  async create(data: OrderDto): Promise<OrderDto> {
    const item = await orderModel.create(data);
    return item;
  }

  async update(
    id?: mongoose.Types.ObjectId,
    name?: string,
    data?: OrderDto
  ): Promise<OrderDto> {
    const filter = this.getFilter(id, name);
    const item = await orderModel.findOneAndUpdate(filter, data, {
      new: true,
    });
    return item;
  }

  async delete(id?: mongoose.Types.ObjectId, name?: string): Promise<OrderDto> {
    const filter = this.getFilter(id, name);
    const item = await orderModel.remove(filter);
    return item;
  }
}

export default new OrderService();
