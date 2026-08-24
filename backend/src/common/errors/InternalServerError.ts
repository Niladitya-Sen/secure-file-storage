import ApplicationError from "./ApplicationError";

export default class InternalServerError extends ApplicationError {
  constructor(message: string) {
    super(message, 500);
    this.name = "InternalServerError";
  }
}
