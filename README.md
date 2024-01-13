# next-make-app-proxy [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/verzac/next-make-app-proxy/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/next-make-app-proxy?style=flat)](https://www.npmjs.com/package/next-make-app-proxy)

Create a [NextJS App Router Route Handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) that forwards your requests to a separate backend server, with the option to inject contextual information to your requests (e.g. your users' access token).

# Features

1. Zero configurations needed, and highly configurable.
2. Zero dependencies.
3. Protect your backend using your NextJS sessions. Integrate with libraries like [@auth0/nextjs-auth0](https://www.npmjs.com/package/@auth0/nextjs-auth0).
4. Inject things (e.g. access tokens, API keys, whatever) into the request header that you'll be sending to your backend.

> **Why would you create this?** Don't we already have [rewrites](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites#rewrite-parameters)?

> Because you can't inject headers to the requests being sent. I wanted to inject the user's access token that is stored in the Auth0 SDK to all downstream requests, so my Go API can validate my user's authentication.

# Getting Started

## Installation

NextJS is only included as a peer dependency, so make sure you've installed it beforehand.

```bash
# for yarn
yarn add next next-make-app-proxy

# for npm
npm i next next-make-app-proxy
```

## Usage

### Basic

```typescript
// app/api/my-api/route.ts
import { makeProxyHandler } from 'next-make-app-proxy'

// generic GET handler
export const GET = makeProxyHandler('https://yourapi.com/my-api')

// forwards your request body to your backend
export const POST = makeProxyHandler('https://yourapi.com/my-api', {
  withReqBody: true,
})
```

### With path params

```typescript
// app/api/my-api/[id]/route.ts
import { makeProxyHandler } from 'next-make-app-proxy'

// path params will be automatically forwarded - example usage: curl localhost:3000/api/my-api/123
export const GET = makeProxyHandler('https://yourapi.com/my-api/:id')
```

## Advanced Usage

### Customising your app's default proxy handler (bonus: with Auth0 SDK example)

```typescript
// some/path/to/your/default/proxy/handler.ts
import { getCommonHeaders } from '@/server/utils/headers' // internal lib
import { withApiAuthRequired } from '@auth0/nextjs-auth0' // version ^3.5.0
import { proxy } from 'next-make-app-proxy'

const appProxy = proxy.withOpts({
  async headers(): Promise<Record<string, string>> {
    // this injects the user's access token to the Authorization header of all of my proxied requests
    return await getCommonHeaders()
  },
  // this actually works - wrap the resulting Route Handler with whatever HOC (Higher Order Component) you want
  hocWrappers: [withApiAuthRequired],
})

// it's important to bind it, otherwise it won't be able to retrieve your default opts
export const makeProxyHandler = appProxy.makeProxyHandler.bind(appProxy)

// app/api/my-api/route.ts
import { makeProxyHandler } from 'some/path/to/your/default/proxy/handler.ts' // import it

// use it
export const GET = makeProxyHandler('https://yourapi.com/my-api/:id')

// you can also override each individual option
export const POST = makeProxyHandler('https://yourapi.com/my-api', {
  withReqBody: true,
})
```

# Contributing? Need a Feature?

Just chuck me a PR or an Issue in the repo and I'll review it. No need for templates (for now).

[New Issue](https://github.com/verzac/next-make-app-proxy/issues/new)
