import mongoose from "mongoose";
import statusModel, { StatusDto } from "./status.model";

class StatusService {
  async storeErrorMessageAndThrowException(
    error_message: string,
    throwException = true
  ): Promise<void> {
    await this.create({
      error_message: error_message,
    });
    if (throwException) {
      throw error_message;
    }
  }
  async touch(
    id?: mongoose.Types.ObjectId,
    name?: string,
    data?: StatusDto
  ): Promise<StatusDto> {
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
      item = await this.create(data);
    } else if (data) {
      item = await this.update(id, name, data);
    }
    return item;
  }

  private getFilter(id?: mongoose.Types.ObjectId, name?: string): StatusDto {
    let filter: StatusDto = {};
    if (id) {
      filter._id = id;
    }
    if (name) {
      filter.order_name = name;
    }
    return filter;
  }
  async findAll(): Promise<Array<StatusDto>> {
    const items = await statusModel.find();
    return items;
  }

  async find(id?: mongoose.Types.ObjectId, name?: string): Promise<StatusDto> {
    const filter = this.getFilter(id, name);
    const item = await statusModel.findOne(filter);
    return item;
  }

  async create(data: StatusDto): Promise<StatusDto> {
    const item = await statusModel.create(data);
    return item;
  }

  async update(
    id?: mongoose.Types.ObjectId,
    name?: string,
    data?: StatusDto
  ): Promise<StatusDto> {
    const filter = this.getFilter(id, name);
    const item = await statusModel.findOneAndUpdate(filter, data, {
      new: true,
    });
    return item;
  }

  async delete(
    id?: mongoose.Types.ObjectId,
    name?: string
  ): Promise<StatusDto> {
    const filter = this.getFilter(id, name);
    const item = await statusModel.remove(filter);
    return item;
  }
}

export default new StatusService();
