import combineRouters from "koa-combine-routers";

import routerRoot from "./root/root.module";
import routerAuth from "./auth/auth.module";
import routerMessage from "./message/message.module";

const router = combineRouters(routerRoot, routerAuth, routerMessage);

export default router;
