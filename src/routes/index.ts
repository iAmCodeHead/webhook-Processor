import { Router } from "express";
import wehbook from "./webhook.route";
import metrics from "./metrics.route";

const routes = Router();

routes.use("/metrics", metrics);
routes.use("/webhook", wehbook);

export default routes;