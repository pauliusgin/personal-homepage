import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// `proxy.ts` is the Next.js 16 replacement for the former `middleware.ts`
// convention. next-intl still ships the handler under `next-intl/middleware`.
export default createMiddleware(routing);

export const config = {
  // Match every pathname except API routes, Next.js internals and files with an
  // extension (favicon.ico, images, fonts, ...).
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
