import Router from "koa-router";

import config from "../../config";
import controller from "./status.controller";
import jwtCheck from "../../middlewares/jwtCheck";

const ROUTES_PREFIX = "/statuses";

const router = new Router();
router.prefix(config.api_prefix + ROUTES_PREFIX);
router.get("/", jwtCheck, controller.findAll);
router.get("/:name", jwtCheck, controller.find);
router.post("/", jwtCheck, controller.create);
router.patch("/:name", jwtCheck, controller.update);
router.delete("/:name", jwtCheck, controller.delete);

export default router;
