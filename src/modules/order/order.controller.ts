import mongoose from "mongoose";
import { RouterContext } from "koa-router";

import { OrderDto } from "./order.model";
import orderService from "./order.service";

class OrderController {
  async findAll(ctx: RouterContext) {
    ctx.body = await orderService.findAll();
    return ctx;
  }

  async find(ctx: RouterContext) {
    try {
      const item = await orderService.find(undefined, ctx.params.name);
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
    }
    return ctx;
  }

  async create(ctx: RouterContext) {
    try {
      const item = await orderService.create(ctx.request.body as OrderDto);
      ctx.body = item;
    } catch (e) {
      ctx.throw(422);
    }
    return ctx;
  }

  async update(ctx: RouterContext) {
    try {
      const item = await orderService.update(
        undefined,
        ctx.params.name,
        ctx.request.body as OrderDto
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
      const item = await orderService.delete(undefined, ctx.params.name);
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
      // ctx.throw(403);
    }
    return ctx;
  }
}

export default new OrderController();
