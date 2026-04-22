import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth/callback).*)",
  ],
};
