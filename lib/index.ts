import { NextRequest, NextResponse } from 'next/server'
import { AppRouteHandlerFn } from './types'
import { log } from './log'

function augmentWithParams(
  path: string,
  params: Record<string, string | string[]> = {}
) {
  // Use a regular expression to match patterns like /:id or /:myArg
  const regex = /\/:([a-z]+)/g

  // Use the replace method with a function as the second argument
  const replacedString = path.replace(regex, (match, paramName) => {
    // Check if the parameter name exists in the values object
    if (params[paramName]) {
      const param = params[paramName]
      if (typeof param === 'string') {
        // If it exists, replace with the corresponding value
        return '/' + param
      } else {
        throw new Error('non string param: ' + JSON.stringify(param))
      }
    } else {
      // If not, keep the original pattern
      throw new Error(`proxy: missing paramName=${paramName}`)
    }
  })

  return replacedString
}

interface ProxyHandlerOpts {
  withReqBody?: boolean
  customMethod?: string
  headers: () => HeadersInit
}

export function makeProxyHandler(
  url: string,
  { withReqBody, customMethod, headers }: ProxyHandlerOpts = {
    headers: () => ({}),
  }
): AppRouteHandlerFn {
  return async function proxiedHandler(req, { params }) {
    const method = customMethod ?? req.method
    const requestInit: RequestInit = {
      headers: {
        ...headers(),
      },
      method,
    }
    if (withReqBody) {
      const reqBody = await req.json()
      requestInit.body = JSON.stringify(reqBody)
    }
    const searchQueryParams = req.nextUrl.search
    const urlToFetch = augmentWithParams(url, params) + searchQueryParams
    let time = 0
    if (process.env.APP_LOG_PROXY === 'true') {
      log('proxy.request', { urlToFetch })
      time = Date.now()
    }
    const result = await fetch(urlToFetch, requestInit)
    if (process.env.APP_LOG_PROXY === 'true') {
      log('proxy.response', {
        status: result.status,
        time: Date.now() - time,
      })
    }
    // parse json
    if (result.status === 204) {
      return new Response(null, { status: result.status })
    }
    return NextResponse.json(await result.json(), { status: result.status })
  }
}