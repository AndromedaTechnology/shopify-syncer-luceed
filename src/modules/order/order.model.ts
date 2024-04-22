import mongoose, { Mongoose, Schema } from "mongoose";

export class OrderDto {
  /**
   * ID of order
   */
  _id?: mongoose.Types.ObjectId;

  order_id?: number;
  name?: string;
  number?: number;
  order_number?: number;

  created_at?: Date;
  confirmed?: boolean;
  fulfillment_status?: any;
  createdAt?: Date;
  updatedAt?: Date;
  syncedAt?: Date;
}

const orderSchema = new Schema({
  // _id: {
  //   type: mongoose.Types.ObjectId,
  //   required: false,
  // },
  order_id: {
    /**
     * Don't allow create for records already existing with the same prop
     */
    drop_dups: true,
    type: Number,
    required: false,
    default: null,
  },
  name: {
    unique: true,
    /**
     * Don't allow create for records already existing with the same prop
     */
    drop_dups: true,
    type: String,
    required: false,
    default: null,
  },
  number: {
    type: Number,
    required: false,
    default: null,
  },
  order_number: {
    type: Number,
    required: false,
    default: null,
  },
  created_at: {
    type: Date,
    required: false,
    default: null,
  },
  confirmed: {
    type: Boolean,
    required: false,
    default: null,
  },
  fulfillment_status: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    default: null,
  },

  createdAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
  syncedAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
