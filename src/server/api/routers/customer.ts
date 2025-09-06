import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const customerRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.customer.findMany({
      orderBy: { customerName: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.customer.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        customerName: z.string().min(1),
        address: z.string().min(1),
        telNo: z.string().optional(),
        mobileNo: z.string().optional(),
        tin: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.customer.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        customerName: z.string().min(1),
        address: z.string().min(1),
        telNo: z.string().optional(),
        mobileNo: z.string().optional(),
        tin: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.customer.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.customer.delete({
        where: { id: input.id },
      });
    }),
});
