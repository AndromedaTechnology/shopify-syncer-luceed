import mongoose, { Schema } from "mongoose";

export class ProductDto {
  _id?: mongoose.Types.ObjectId;
  handle?: String;
  title?: String;
  vendor?: String;
  variant_sku?: String;
  variant_price?: String;
  shopify_product_id?: Number;
  /**
   * TODO: Save following fields also.
   * Fields above are saved.
   */
  shopify_variant_id?: Number;
  luceed_product_id?: Number;
  is_visible_on_webshop?: Boolean;
  is_selling_on_webshop?: Boolean;
  createdAt?: Date;
  updatedAt?: Date;
  syncedAt?: Date;
}

const productSchema = new Schema({
  // _id: {
  //   type: mongoose.Types.ObjectId,
  //   required: false,
  // },
  handle: {
    unique: true,
    /**
     * Don't allow create for records already existing with the same prop
     */
    drop_dups: true,
    type: String,
    required: false,
    default: null,
  },
  title: {
    type: String,
    required: false,
    default: null,
  },
  vendor: {
    type: String,
    required: false,
    default: null,
  },
  /**
   * Variant
   */
  variant_sku: {
    unique: true,
    /**
     * Don't allow create for records already existing with the same prop
     */
    drop_dups: true,
    type: String,
    required: false,
    default: null,
  },
  variant_price: {
    type: String,
    required: false,
    default: null,
  },
  /**
   * Flags
   */
  is_visible_on_webshop: {
    type: Boolean,
    required: false,
    default: true,
  },
  is_selling_on_webshop: {
    type: Boolean,
    required: false,
    default: true,
  },
  /**
   * Shopify ids
   */
  shopify_product_id: {
    type: Number,
    required: false,
    default: null,
  },
  shopify_variant_id: {
    type: Number,
    required: false,
    default: null,
  },
  /**
   * Luceed ids
   */
  luceed_product_id: {
    type: Number,
    required: false,
    default: null,
  },
  /**
   * Dates
   */
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

const productModel = mongoose.model("Product", productSchema);

export default productModel;
