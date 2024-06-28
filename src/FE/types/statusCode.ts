export type StatusCode = 200 | 400 | 401 | 500;

export const StatusCodeColor: { [key in StatusCode]: string } = {
  500: '#ff4d4f',
  401: '#faad14',
  400: '#faad14',
  200: '#52c41a',
};
