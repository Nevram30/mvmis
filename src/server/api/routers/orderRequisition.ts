import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { OrderStatus } from "@prisma/client";

const laborItemSchema = z.object({
  itemNumber: z.number(),
  description: z.string().min(1),
  expenses: z.number().min(0),
  mechanic: z.string().optional(),
  assignment: z.string().optional(),
  status: z.string().optional(),
});

const materialItemSchema = z.object({
  itemNumber: z.number(),
  quantity: z.number().min(1),
  description: z.string().min(1),
  expenses: z.number().min(0),
});

export const orderRequisitionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.orderRequisition.findMany({
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
          },
        },
        contractor: {
          select: {
            id: true,
            contractorName: true,
          },
        },
        laborItems: true,
        materialItems: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.orderRequisition.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          contractor: true,
          laborItems: {
            orderBy: { itemNumber: "asc" },
          },
          materialItems: {
            orderBy: { itemNumber: "asc" },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string().min(1),
        contractorId: z.string().min(1),
        make: z.string().min(1),
        plateNumber: z.string().min(1),
        engineNumber: z.string().min(1),
        orderDate: z.date().optional(),
        laborItems: z.array(laborItemSchema),
        materialItems: z.array(materialItemSchema),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { laborItems, materialItems, ...orderData } = input;

      // Calculate totals
      const totalLaborAndServicesExpenses = laborItems.reduce(
        (sum, item) => sum + item.expenses,
        0
      );
      const totalPartsAndMaterialExpenses = materialItems.reduce(
        (sum, item) => sum + item.expenses,
        0
      );
      const overallTotal = totalLaborAndServicesExpenses + totalPartsAndMaterialExpenses;

      // Generate OR number (simple implementation)
      const orderCount = await ctx.db.orderRequisition.count();
      const generatedOrNumber = (1000000000 + orderCount + 1).toString();

      return ctx.db.orderRequisition.create({
        data: {
          ...orderData,
          totalLaborAndServicesExpenses,
          totalPartsAndMaterialExpenses,
          overallTotal,
          generatedOrNumber,
          laborItems: {
            create: laborItems,
          },
          materialItems: {
            create: materialItems,
          },
        },
        include: {
          customer: true,
          contractor: true,
          laborItems: true,
          materialItems: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        customerId: z.string().min(1),
        contractorId: z.string().min(1),
        make: z.string().min(1),
        plateNumber: z.string().min(1),
        engineNumber: z.string().min(1),
        orderDate: z.date().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        laborItems: z.array(laborItemSchema),
        materialItems: z.array(materialItemSchema),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, laborItems, materialItems, ...orderData } = input;

      // Calculate totals
      const totalLaborAndServicesExpenses = laborItems.reduce(
        (sum, item) => sum + item.expenses,
        0
      );
      const totalPartsAndMaterialExpenses = materialItems.reduce(
        (sum, item) => sum + item.expenses,
        0
      );
      const overallTotal = totalLaborAndServicesExpenses + totalPartsAndMaterialExpenses;

      // Delete existing items and create new ones
      await ctx.db.orderLaborItem.deleteMany({
        where: { orderRequisitionId: id },
      });
      await ctx.db.orderMaterialItem.deleteMany({
        where: { orderRequisitionId: id },
      });

      return ctx.db.orderRequisition.update({
        where: { id },
        data: {
          ...orderData,
          totalLaborAndServicesExpenses,
          totalPartsAndMaterialExpenses,
          overallTotal,
          laborItems: {
            create: laborItems.map(item => ({ ...item, orderRequisitionId: id })),
          },
          materialItems: {
            create: materialItems.map(item => ({ ...item, orderRequisitionId: id })),
          },
        },
        include: {
          customer: true,
          contractor: true,
          laborItems: true,
          materialItems: true,
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.orderRequisition.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.orderRequisition.delete({
        where: { id: input.id },
      });
    }),

  updateLaborItemStatus: protectedProcedure
    .input(
      z.object({
        laborItemId: z.string(),
        status: z.enum(["approved", "disapproved"]),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.orderLaborItem.update({
        where: { id: input.laborItemId },
        data: { status: input.status },
      });
    }),

  getLaborItems: protectedProcedure
    .input(z.object({ orderRequisitionId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.orderLaborItem.findMany({
        where: { orderRequisitionId: input.orderRequisitionId },
        orderBy: { itemNumber: "asc" },
      });
    }),

  getByLaborItemId: protectedProcedure
    .input(z.object({ laborItemId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First find the labor item to get the order requisition ID
      const laborItem = await ctx.db.orderLaborItem.findUnique({
        where: { id: input.laborItemId },
        select: { orderRequisitionId: true },
      });

      if (!laborItem) {
        throw new Error("Labor item not found");
      }

      // Then get the full order requisition data
      return ctx.db.orderRequisition.findUnique({
        where: { id: laborItem.orderRequisitionId },
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
            },
          },
          contractor: {
            select: {
              id: true,
              contractorName: true,
            },
          },
        },
      });
    }),
});
