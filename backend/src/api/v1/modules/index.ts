import { Router } from "express";
import { authController } from "./auth/auth.controller";
import { filesController } from "./files/files.controller";
import { foldersController } from "./folders/folders.controller";
import validateJwt from "../../../common/middleware/validate-jwt";

const v1Router = Router();

v1Router.use("/auth", authController);

v1Router.use(validateJwt);
v1Router.use("/folders", foldersController);
v1Router.use("/files", filesController);

export default v1Router;
