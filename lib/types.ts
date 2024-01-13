import { NextRequest } from 'next/server'

/**
 * This contains `param`s, which is an object containing the dynamic route parameters for the current route.
 *
 * See https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional
 *
 * @category Server
 */
export type AppRouteHandlerFnContext = {
  params?: Record<string, string | string[]>
}

/**
 * Handler function for app directory api routes.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/route
 *
 * @category Server
 */
export type AppRouteHandlerFn = (
  /**
   * Incoming request object.
   */
  req: NextRequest,
  /**
   * Context properties on the request (including the parameters if this was a
   * dynamic route).
   */
  ctx: AppRouteHandlerFnContext
) => Promise<Response> | Response
