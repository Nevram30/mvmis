import { auth } from "~/server/auth";

export default auth((req) => {
  // req.auth contains the session information
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
