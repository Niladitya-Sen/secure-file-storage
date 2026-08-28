import ApplicationError from "./ApplicationError.ts";

export default class UnauthorizedAccessError extends ApplicationError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
    this.name = "UnauthorizedAccessError";
  }
}
