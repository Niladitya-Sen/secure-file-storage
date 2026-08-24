import "dotenv/config";

import express from "express";
import { env } from "./env.ts";
import modules from "./modules/index.ts";
import handleErrors from "./common/middleware/handle-error.ts";

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(modules);

app.use(handleErrors);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
