import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // const token = request.cookies.get("authToken")?.value;

    // if (!token) {
    //   return NextResponse.redirect(new URL("/login", request.url));
    // }

    // const payload = getClaimsFromToken(token);

    // if (payload.exp && Date.now() >= payload.exp * 1000) {
    //   const response = NextResponse.redirect(new URL("/login", request.url));

    //   response.cookies.set({
    //     name: "authToken",
    //     value: "",
    //     path: "/",
    //     expires: new Date(0),
    //   });

    //   return response;
    // }

    return NextResponse.next();
  } catch (error) {
    console.log("error", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|static|icons|imgs|favicon.ico|logo.png|login|lich-su-kham).*)",
  ],
};
