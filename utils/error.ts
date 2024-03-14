import { NextApiResponse } from 'next';

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
