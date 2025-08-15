import { auth } from "~/server/auth";

export default auth((_req) => {
  // _req.auth contains the session information
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
