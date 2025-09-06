import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { AssignmentType } from "@prisma/client";

export const contractorRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.contractor.findMany({
      orderBy: { contractorName: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.contractor.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        contractorName: z.string().min(1),
        address: z.string().min(1),
        telNo: z.string().optional(),
        mobileNo: z.string().optional(),
        tin: z.string().optional(),
        assignment: z.nativeEnum(AssignmentType),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.contractor.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        contractorName: z.string().min(1),
        address: z.string().min(1),
        telNo: z.string().optional(),
        mobileNo: z.string().optional(),
        tin: z.string().optional(),
        assignment: z.nativeEnum(AssignmentType),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.contractor.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.contractor.delete({
        where: { id: input.id },
      });
    }),

  getByAssignment: protectedProcedure
    .input(z.object({ assignment: z.nativeEnum(AssignmentType) }))
    .query(({ ctx, input }) => {
      return ctx.db.contractor.findMany({
        where: { assignment: input.assignment },
        orderBy: { contractorName: "asc" },
      });
    }),
});
