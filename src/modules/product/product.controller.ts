import mongoose from "mongoose";
import { RouterContext } from "koa-router";

import { ProductDto } from "./product.model";
import productService from "./product.service";

class ProductController {
  async findAll(ctx: RouterContext) {
    ctx.body = await productService.findAll();
    return ctx;
  }

  async find(ctx: RouterContext) {
    try {
      const item = await productService.find(undefined, ctx.params.variant_sku);
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
    }
    return ctx;
  }

  async create(ctx: RouterContext) {
    try {
      const item = await productService.create(ctx.request.body as ProductDto);
      ctx.body = item;
    } catch (e) {
      ctx.throw(422);
    }
    return ctx;
  }

  async update(ctx: RouterContext) {
    try {
      const item = await productService.update(
        undefined,
        ctx.params.variant_sku,
        ctx.request.body as ProductDto
      );
      ctx.body = item;
    } catch (e) {
      ctx.throw(422);
      // ctx.throw(403);
    }
    return ctx;
  }

  async delete(ctx: RouterContext) {
    try {
      const item = await productService.delete(
        undefined,
        ctx.params.variant_sku
      );
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
      // ctx.throw(403);
    }
    return ctx;
  }
}

export default new ProductController();
