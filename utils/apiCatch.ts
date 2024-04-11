import { ApiError } from 'next/dist/server/api-utils';

type ApiRoute = (
  req: Request,
  params: Record<string, string>
) => Response | Promise<Response>;

export function catchAll(route: ApiRoute): ApiRoute {
  return async function catchAllHandler(req, params) {
    try {
      return route(req, params);
    } catch (err) {
      let statusCode = 500;
      let message = 'server error';

      if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      return new Response(message, { status: statusCode });
    }
  };
}
