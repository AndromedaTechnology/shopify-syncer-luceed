import combineRouters from "koa-combine-routers";

import routerRoot from "./root/root.module";
import routerAuth from "./auth/auth.module";
import routerMessage from "./message/message.module";
import routerShopify from "./shopify/shopify.module";
import routerLuceed from "./luceed/luceed.module";

const router = combineRouters(
  routerRoot,
  routerAuth,
  routerMessage,
  routerShopify,
  routerLuceed
);

export default router;
