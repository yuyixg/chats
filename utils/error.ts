export class BaseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Sorry, there was an error';
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string) {
    super(message);
    this.statusCode = 500;
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Internal Server Error';
  }
}

export class Unauthorized extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Unauthorized';
  }
}

export class BadRequest extends BaseError {
  constructor(message: string = 'Bad Request') {
    super(message);
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Bad Request';
  }
}

export class ModelUnauthorized extends BaseError {
  constructor(
    message: string = 'The Model does not exist or access is denied'
  ) {
    super(message);
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Unauthorized';
  }
}
