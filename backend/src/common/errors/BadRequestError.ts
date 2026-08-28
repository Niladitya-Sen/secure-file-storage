import ApplicationError from "./ApplicationError.ts";

export default class BadRequestError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
    this.name = "BadRequestError";
  }
}
