import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Verify JWT
    // const { payload } = await jwtVerify(
    //   token,
    //   new TextEncoder().encode(process.env.JWT_SECRET!)
    // );
    // console.log("payload ==== ", payload);

    return NextResponse.next();
  } catch (error) {
    console.log("error", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|static|icons|imgs|favicon.ico|logo.png|login).*)"],
};
