import combineRouters from "koa-combine-routers";

import routerRoot from "./root/root.module";
import routerAuth from "./auth/auth.module";
import routerProduct from "./product/product.module";
import routerShopify from "./shopify/shopify.module";
import routerLuceed from "./luceed/luceed.module";

const router = combineRouters(
  routerRoot,
  routerAuth,
  routerProduct,
  routerShopify,
  routerLuceed
);

export default router;
