export const enum UserRole {
  'admin' = 'admin',
}

export interface GetUsersModelsResult {
  userId: string;
  userName: string;
  role: string;
}
