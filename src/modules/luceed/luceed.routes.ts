import Router from "koa-router";

import config from "../../config";
import controller from "./luceed.controller";
import jwtCheck from "../../middlewares/jwtCheck";

const ROUTES_PREFIX = "/luceed";

const router = new Router();
router.prefix(config.api_prefix + ROUTES_PREFIX);
router.get("/products", jwtCheck, controller.findAllProducts);
router.get("/orders", jwtCheck, controller.findAllOrders);
router.post("/syncProducts", controller.syncLuceedProductsToShopify);

export default router;
