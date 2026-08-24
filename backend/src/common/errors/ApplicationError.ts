export default class ApplicationError extends Error {
  private readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApplicationError";
    this.statusCode = statusCode;
  }

  public getStatusCode(): number {
    return this.statusCode;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
