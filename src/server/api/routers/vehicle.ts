import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  make: z.string().min(1, "Make is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  purchaseDate: z.date(),
  purchaseCost: z.number().positive("Purchase cost must be positive"),
});

export const vehicleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create vehicle records
      if (ctx.session.user.role !== "SECRETARY" && ctx.session.user.role !== "ADMIN") {
        throw new Error("Insufficient permissions");
      }

      // Check if plate number already exists
      const existingVehicleByPlate = await ctx.db.vehicle.findUnique({
        where: { plateNumber: input.plateNumber },
      });

      if (existingVehicleByPlate) {
        throw new Error("A vehicle with this plate number already exists");
      }

      // Check if engine number already exists
      const existingVehicleByEngine = await ctx.db.vehicle.findUnique({
        where: { engineNumber: input.engineNumber },
      });

      if (existingVehicleByEngine) {
        throw new Error("A vehicle with this engine number already exists");
      }

      // Create the vehicle record
      const vehicle = await ctx.db.vehicle.create({
        data: {
          plateNumber: input.plateNumber.toUpperCase(),
          make: input.make,
          engineNumber: input.engineNumber,
          purchaseDate: input.purchaseDate,
          purchaseCost: input.purchaseCost,
        },
      });

      return {
        message: "Vehicle record created successfully",
        vehicle: {
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          make: vehicle.make,
          engineNumber: vehicle.engineNumber,
          purchaseDate: vehicle.purchaseDate,
          purchaseCost: vehicle.purchaseCost,
        },
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const vehicles = await ctx.db.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { vehicles };
  }),
});
