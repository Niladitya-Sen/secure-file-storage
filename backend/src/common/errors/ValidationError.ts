import BadRequestError from "./BadRequestError.ts";

export default class ValidationError extends BadRequestError {
  private readonly validationErrors: Record<string, string>;

  constructor(message: string, validationErrors: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
    this.validationErrors = validationErrors;
  }

  public toJSON() {
    return {
      name: this.name,
      statusCode: this.getStatusCode(),
      message: this.message,
      validationErrors: this.validationErrors,
    };
  }
}
