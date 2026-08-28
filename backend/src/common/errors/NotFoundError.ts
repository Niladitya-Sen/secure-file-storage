import ApplicationError from "./ApplicationError.ts";

export default class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
