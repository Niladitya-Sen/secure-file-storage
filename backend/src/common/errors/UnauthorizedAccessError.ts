import ApplicationError from "./ApplicationError";

export default class UnauthorizedAccessError extends ApplicationError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
    this.name = "UnauthorizedAccessError";
  }
}
