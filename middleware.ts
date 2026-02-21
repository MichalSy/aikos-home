import { createMiddleware } from '@michalsy/aiko-webapp-core/middleware'

export const middleware = createMiddleware({
  protectedPaths: ['/dashboard', '/api'],
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
