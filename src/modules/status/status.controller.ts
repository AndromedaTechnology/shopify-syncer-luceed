import mongoose from "mongoose";
import { RouterContext } from "koa-router";

import { StatusDto } from "./status.model";
import statusService from "./status.service";

class StatusController {
  async findAll(ctx: RouterContext) {
    ctx.body = await statusService.findAll();
    return ctx;
  }

  async find(ctx: RouterContext) {
    try {
      const item = await statusService.find(undefined, ctx.params.name);
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
    }
    return ctx;
  }

  async create(ctx: RouterContext) {
    try {
      const item = await statusService.create(ctx.request.body as StatusDto);
      ctx.body = item;
    } catch (e) {
      ctx.throw(422);
    }
    return ctx;
  }

  async update(ctx: RouterContext) {
    try {
      const item = await statusService.update(
        undefined,
        ctx.params.name,
        ctx.request.body as StatusDto
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
      const item = await statusService.delete(undefined, ctx.params.name);
      ctx.body = item;
    } catch (e) {
      ctx.throw(404);
      // ctx.throw(403);
    }
    return ctx;
  }
}

export default new StatusController();
