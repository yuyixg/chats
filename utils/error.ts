import { NextApiResponse } from 'next';

export class ChatsError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Sorry, there was an error.';
  }
}

export class InternalServerError extends ChatsError {
  constructor(message: string) {
    super(message);
    this.statusCode = 500;
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Internal Server Error';
  }
}

export class Unauthorized extends ChatsError {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.statusCode = 401;
    this.name = 'Unauthorized';
  }
}

export class BadRequest extends ChatsError {
  constructor(message: string = 'Bad Request') {
    super(message);
    this.statusCode = 400;
    this.name = 'Bad Request';
  }
}

export function unauthorized(
  res: NextApiResponse,
  messages: string = 'Unauthorized.'
) {
  return res.status(401).json({ messages });
}

export function internalServerError(
  res: NextApiResponse,
  messages: string = 'Sorry, there was an error.'
) {
  return res.status(500).json({ messages });
}

export function modelUnauthorized(
  res: NextApiResponse,
  messages: string = 'The Model does not exist or access is denied.'
) {
  return res.status(401).json({ messages });
}

export function badRequest(res: NextApiResponse, messages?: string) {
  return res.status(400).json({ messages });
}
