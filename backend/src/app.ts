import "dotenv/config";

import express from "express";
import { env } from "./env.ts";
import handleErrors from "./common/middleware/handle-error.ts";
import apiRouter from "./api/index.ts";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/api", apiRouter);

app.use(handleErrors);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
