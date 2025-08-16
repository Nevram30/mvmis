import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createRegistrationSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  soldTo: z.string().min(1, "Buyer name is required"),
  registrationDate: z.date(),
  statusChecklist: z.object({
    deedOfSale: z.boolean(),
    id: z.boolean(),
    mayorPermit: z.boolean(),
  }).refine(
    (data) => data.deedOfSale && data.id && data.mayorPermit,
    {
      message: "All status items must be checked before submitting",
    }
  ),
});

export const registrationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createRegistrationSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create registration records
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

      // Check if registration already exists for this vehicle
      const existingRegistration = await ctx.db.registration.findFirst({
        where: { vehicleId: input.vehicleId },
      });

      if (existingRegistration) {
        throw new Error("Registration already exists for this vehicle");
      }

      // Store all three status items separately
      const registration = await ctx.db.registration.create({
        data: {
          vehicleId: input.vehicleId,
          soldTo: input.soldTo,
          registrationDate: input.registrationDate,
          deedOfSale: input.statusChecklist.deedOfSale,
          idStatus: input.statusChecklist.id,
          mayorPermit: input.statusChecklist.mayorPermit,
        },
      });

      return {
        message: "Registration record created successfully",
        registration: {
          id: registration.id,
          vehicleId: registration.vehicleId,
          soldTo: registration.soldTo,
          registrationDate: registration.registrationDate,
          deedOfSale: registration.deedOfSale,
          idStatus: registration.idStatus,
          mayorPermit: registration.mayorPermit,
          createdAt: registration.createdAt,
        },
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const registrations = await ctx.db.registration.findMany({
      include: {
        vehicle: {
          select: {
            plateNumber: true,
            make: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { registrations };
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const registration = await ctx.db.registration.findUnique({
        where: { id: input.id },
        include: {
          vehicle: {
            select: {
              plateNumber: true,
              make: true,
            },
          },
        },
      });

      if (!registration) {
        throw new Error("Registration not found");
      }

      return { registration };
    }),
});
