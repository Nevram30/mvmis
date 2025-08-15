import { createCallerFactory, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { vehicleRouter } from "~/server/api/routers/vehicle";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(() => {
    return { message: "Hello from tRPC!" };
  }),
  vehicle: vehicleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.someRouter.someMethod();
 */
export const createCaller = createCallerFactory(appRouter);
