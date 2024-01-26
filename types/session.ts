import { Session } from 'next-auth';

export interface ISession extends Session {
  error: string | Error;
}
