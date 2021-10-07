import mongoose, { Schema } from "mongoose";

export class MessageDto {
  _id?: mongoose.Types.ObjectId;
  content?: string;
  createdAt?: Date;
}

const messageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
