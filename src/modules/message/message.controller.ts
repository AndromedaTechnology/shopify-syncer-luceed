import mongoose from "mongoose";
import { RouterContext } from "koa-router";

import { MessageDto } from "./message.model";
import messageService from "./message.service";

class MessageController {
  async findAll(ctx: RouterContext) {
    ctx.body = await messageService.findAll();
    return ctx;
  }

  async find(ctx: RouterContext) {
    try {
      const item = await messageService.find(
        mongoose.Types.ObjectId(ctx.params.id)
      );
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
    }
    return ctx;
  }

  async create(ctx: RouterContext) {
    try {
      const item = await messageService.create(ctx.request.body as MessageDto);
      ctx.body = item;
    } catch (e) {
      ctx.throw(422);
    }
    return ctx;
  }

  async update(ctx: RouterContext) {
    try {
      const item = await messageService.update(
        mongoose.Types.ObjectId(ctx.params.id),
        ctx.request.body as MessageDto
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
      const item = await messageService.delete(
        mongoose.Types.ObjectId(ctx.params.id)
      );
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
      // ctx.throw(403);
    }
    return ctx;
  }
}

export default new MessageController();
