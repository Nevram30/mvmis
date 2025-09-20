import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const workOrderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      orderRequisitionId: z.string(),
      contractorId: z.string(),
      laborRepairId: z.string().optional(),
      customerBilling: z.number(),
      expenses: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workOrder.create({
        data: {
          orderRequisitionId: input.orderRequisitionId,
          contractorId: input.contractorId,
          laborRepairId: input.laborRepairId,
          customerBilling: input.customerBilling,
          expenses: input.expenses,
        },
        include: {
          orderRequisition: {
            include: {
              customer: true,
              contractor: true,
            },
          },
          contractor: true,
          laborRepairForm: true,
        },
      });
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.workOrder.findMany({
        include: {
          orderRequisition: {
            include: {
              customer: true,
              contractor: true,
            },
          },
          contractor: true,
          laborRepairForm: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.workOrder.findUnique({
        where: { id: input.id },
        include: {
          orderRequisition: {
            include: {
              customer: true,
              contractor: true,
              laborItems: true,
              materialItems: true,
            },
          },
          contractor: true,
          laborRepairForm: true,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      customerBilling: z.number().optional(),
      expenses: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.workOrder.update({
        where: { id },
        data: updateData,
        include: {
          orderRequisition: {
            include: {
              customer: true,
              contractor: true,
            },
          },
          contractor: true,
          laborRepairForm: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workOrder.delete({
        where: { id: input.id },
      });
    }),
});
