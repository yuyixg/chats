import { NextApiRequest, NextApiResponse } from 'next/types';

import { Session } from './session';

export interface ChatsApiRequest extends NextApiRequest {
  session: Session;
}

export interface ChatsApiResponse extends NextApiResponse {
  session: Session;
}
