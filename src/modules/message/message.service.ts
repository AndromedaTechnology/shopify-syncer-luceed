import mongoose from "mongoose";
import messageModel, { MessageDto } from "./message.model";

class MessageService {
  async findAll(): Promise<Array<MessageDto>> {
    const items = await messageModel.find();
    return items;
  }

  async find(id: mongoose.Types.ObjectId): Promise<MessageDto> {
    const item = await messageModel.findById(id);
    return item;
  }

  async create(data: MessageDto): Promise<MessageDto> {
    const item = await messageModel.create(data);
    return item;
  }

  async update(
    id: mongoose.Types.ObjectId,
    data: MessageDto
  ): Promise<MessageDto> {
    const item = await messageModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return item;
  }

  async delete(id: mongoose.Types.ObjectId): Promise<MessageDto> {
    const item = await messageModel.findByIdAndRemove(id);
    return item;
  }
}

export default new MessageService();
