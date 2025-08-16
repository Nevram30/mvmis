import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  make: z.string().min(1, "Make is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  purchaseDate: z.date(),
  purchaseCost: z.number().positive("Purchase cost must be positive"),
});

const updateVehicleSchema = z.object({
  id: z.string().min(1, "Vehicle ID is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  make: z.string().min(1, "Make is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  purchaseDate: z.date(),
  purchaseCost: z.number().positive("Purchase cost must be positive"),
});

const createSellingPriceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  sellingPrice: z.number().positive("Selling price must be positive"),
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

  update: protectedProcedure
    .input(updateVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update vehicle records
      if (ctx.session.user.role !== "SECRETARY" && ctx.session.user.role !== "ADMIN") {
        throw new Error("Insufficient permissions");
      }

      // Check if the vehicle exists
      const existingVehicle = await ctx.db.vehicle.findUnique({
        where: { id: input.id },
      });

      if (!existingVehicle) {
        throw new Error("Vehicle not found");
      }

      // Check if plate number already exists (excluding current vehicle)
      const existingVehicleByPlate = await ctx.db.vehicle.findFirst({
        where: { 
          plateNumber: input.plateNumber,
          NOT: { id: input.id }
        },
      });

      if (existingVehicleByPlate) {
        throw new Error("A vehicle with this plate number already exists");
      }

      // Check if engine number already exists (excluding current vehicle)
      const existingVehicleByEngine = await ctx.db.vehicle.findFirst({
        where: { 
          engineNumber: input.engineNumber,
          NOT: { id: input.id }
        },
      });

      if (existingVehicleByEngine) {
        throw new Error("A vehicle with this engine number already exists");
      }

      // Update the vehicle record
      const vehicle = await ctx.db.vehicle.update({
        where: { id: input.id },
        data: {
          plateNumber: input.plateNumber.toUpperCase(),
          make: input.make,
          engineNumber: input.engineNumber,
          purchaseDate: input.purchaseDate,
          purchaseCost: input.purchaseCost,
        },
      });

      return {
        message: "Vehicle record updated successfully",
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

  createSellingPrice: protectedProcedure
    .input(createSellingPriceSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create selling price records
      if (ctx.session.user.role !== "SECRETARY" && ctx.session.user.role !== "ADMIN") {
        throw new Error("Insufficient permissions");
      }

      // Verify the vehicle exists
      const vehicle = await ctx.db.vehicle.findUnique({
        where: { id: input.vehicleId },
      });

      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      // Create the selling price record
      const sellingPrice = await ctx.db.sellingPrice.create({
        data: {
          vehicleId: input.vehicleId,
          sellingPrice: input.sellingPrice,
        },
      });

      return {
        message: "Selling price record created successfully",
        sellingPrice: {
          id: sellingPrice.id,
          vehicleId: sellingPrice.vehicleId,
          sellingPrice: sellingPrice.sellingPrice,
          createdAt: sellingPrice.createdAt,
        },
      };
    }),

  getAllWithSellingPrices: protectedProcedure.query(async ({ ctx }) => {
    const vehicles = await ctx.db.vehicle.findMany({
      include: {
        sellingPrices: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { vehicles };
  }),
});
