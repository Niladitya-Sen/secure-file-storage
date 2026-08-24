import { Router } from "express";
import { authController } from "./auth/auth.controller";
import { filesController } from "./files/files.controller";

const modules = Router();

modules.use("/auth", authController);
modules.use("/files", filesController);

export default modules;
