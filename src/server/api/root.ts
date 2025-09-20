import { createCallerFactory, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { vehicleRouter } from "~/server/api/routers/vehicle";
import { registrationRouter } from "~/server/api/routers/registration";
import { customerRouter } from "~/server/api/routers/customer";
import { contractorRouter } from "~/server/api/routers/contractor";
import { orderRequisitionRouter } from "~/server/api/routers/orderRequisition";
import { laborRepairFormRouter } from "~/server/api/routers/laborRepairForm";
import { workOrderRouter } from "~/server/api/routers/workOrder";

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
  registration: registrationRouter,
  customer: customerRouter,
  contractor: contractorRouter,
  orderRequisition: orderRequisitionRouter,
  laborRepairForm: laborRepairFormRouter,
  workOrder: workOrderRouter,
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
