import Router from "koa-router";

import config from "../../config";
import controller from "./shopify.controller";
import jwtCheck from "../../middlewares/jwtCheck";

const ROUTES_PREFIX = "/shopify";

const router = new Router();
router.prefix(config.api_prefix + ROUTES_PREFIX);
router.get("/products", jwtCheck, controller.findAllProducts);
router.get("/orders", jwtCheck, controller.findAllOrders);
router.post("/syncOrders", controller.syncShopifyOrdersToLuceed);

export default router;
