export interface Session {
  userId: string;
  username: string | null;
  role: string | null;
  provider: string | null;
  sub: string | null;
}
