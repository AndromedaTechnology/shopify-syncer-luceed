import mongoose, { Mongoose, Schema } from "mongoose";

export class StatusDto {
  _id?: mongoose.Types.ObjectId;

  parent_id?: mongoose.Types.ObjectId;

  luceed_product_id?: string;
  shopify_product_id?: string;

  product_variant_sku?: string;

  order_name?: string;

  error_message?: string;

  createdAt?: Date;
  updatedAt?: Date;
  syncedAt?: Date;
}

const orderSchema = new Schema({
  // _id: {
  //   type: mongoose.Types.ObjectId,
  //   required: false,
  // },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null,
  },
  luceed_product_id: {
    type: String,
    required: false,
    default: null,
  },
  shopify_product_id: {
    type: String,
    required: false,
    default: null,
  },
  product_variant_sku: {
    type: String,
    required: false,
    default: null,
  },
  order_name: {
    type: String,
    required: false,
    default: null,
  },
  error_message: {
    type: String,
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

const orderModel = mongoose.model("Status", orderSchema);

export default orderModel;
