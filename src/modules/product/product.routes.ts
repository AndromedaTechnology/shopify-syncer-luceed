import Router from "koa-router";

import config from "../../config";
import controller from "./product.controller";
import jwtCheck from "../../middlewares/jwtCheck";

const ROUTES_PREFIX = "/products";

const router = new Router();
router.prefix(config.api_prefix + ROUTES_PREFIX);
router.get("/", jwtCheck, controller.findAll);
router.get("/:variant_sku", jwtCheck, controller.find);
router.post("/", jwtCheck, controller.create);
router.patch("/:variant_sku", jwtCheck, controller.update);
router.delete("/:variant_sku", jwtCheck, controller.delete);

export default router;
