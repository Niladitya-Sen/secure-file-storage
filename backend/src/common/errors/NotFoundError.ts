import ApplicationError from "./ApplicationError";

export default class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
