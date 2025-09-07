import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const cashAdvanceSchema = z.object({
  date: z.date(),
  amount: z.number().min(0),
  balance: z.number(),
});

export const laborRepairFormRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.laborRepairForm.findMany({
      include: {
        orderLaborItem: {
          include: {
            orderRequisition: {
              include: {
                customer: true,
                contractor: true,
              },
            },
          },
        },
        cashAdvances: {
          orderBy: { date: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.laborRepairForm.findUnique({
        where: { id: input.id },
        include: {
          orderLaborItem: {
            include: {
              orderRequisition: {
                include: {
                  customer: true,
                  contractor: true,
                },
              },
            },
          },
          cashAdvances: {
            orderBy: { date: "asc" },
          },
        },
      });
    }),

  getByLaborItemId: protectedProcedure
    .input(z.object({ orderLaborItemId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.laborRepairForm.findFirst({
        where: { orderLaborItemId: input.orderLaborItemId },
        include: {
          orderLaborItem: {
            include: {
              orderRequisition: {
                include: {
                  customer: true,
                  contractor: true,
                },
              },
            },
          },
          cashAdvances: {
            orderBy: { date: "asc" },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        orderLaborItemId: z.string().min(1),
        contractorName: z.string().min(1),
        make: z.string().min(1),
        plateNumber: z.string().min(1),
        engineNumber: z.string().min(1),
        amount: z.number().min(0),
        orNumber: z.string().optional(),
        scopeOfWorkDetails: z.string().optional(),
        cashAdvances: z.array(cashAdvanceSchema).optional().default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { cashAdvances, ...formData } = input;

        // Generate LRF number (simple implementation)
        let lrfCount: number;
        try {
          lrfCount = await ctx.db.laborRepairForm.count();
        } catch (error) {
          console.error("Error counting labor repair forms:", error);
          throw new Error("Failed to generate LRF number: Unable to count existing records");
        }

        const lrfNumber = `LRF-${(2000000000 + lrfCount + 1).toString()}`;

        // Calculate running balances for cash advances
        const cashAdvancesWithBalances = [];
        let runningBalance = formData.amount;
        
        for (const advance of cashAdvances) {
          if (!advance) continue;
          
          runningBalance = runningBalance - advance.amount;
          
          cashAdvancesWithBalances.push({
            date: advance.date,
            amount: advance.amount,
            balance: runningBalance,
          });
        }

        // Calculate total cash advance
        const totalCashAdvance = cashAdvancesWithBalances.reduce(
          (sum, advance) => sum + advance.amount,
          0
        );

        // Set current date for review and approval
        const currentDate = new Date();

        return await ctx.db.laborRepairForm.create({
          data: {
            ...formData,
            lrfNumber,
            totalCashAdvance,
            reviewedBy: currentDate,
            approvedBy: currentDate,
            cashAdvances: {
              create: cashAdvancesWithBalances,
            },
          },
          include: {
            orderLaborItem: {
              include: {
                orderRequisition: {
                  include: {
                    customer: true,
                    contractor: true,
                  },
                },
              },
            },
            cashAdvances: {
              orderBy: { date: "asc" },
            },
          },
        });
      } catch (error) {
        console.error("Error in laborRepairForm.create:", error);
        throw new Error(`Failed to create labor repair form: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        contractorName: z.string().min(1),
        make: z.string().min(1),
        plateNumber: z.string().min(1),
        engineNumber: z.string().min(1),
        amount: z.number().min(0),
        orNumber: z.string().optional(),
        scopeOfWorkDetails: z.string().optional(),
        cashAdvances: z.array(cashAdvanceSchema).optional().default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, cashAdvances, ...formData } = input;

      // Calculate running balances for cash advances
      const cashAdvancesWithBalances = [];
      let runningBalance = formData.amount;
      
      for (const advance of cashAdvances) {
        if (!advance) continue;
        
        runningBalance = runningBalance - advance.amount;
        
        cashAdvancesWithBalances.push({
          date: advance.date,
          amount: advance.amount,
          balance: runningBalance,
        });
      }

      // Calculate total cash advance
      const totalCashAdvance = cashAdvancesWithBalances.reduce(
        (sum, advance) => sum + advance.amount,
        0
      );

      // Delete existing cash advances and create new ones
      await ctx.db.laborRepairFormCashAdvance.deleteMany({
        where: { laborRepairFormId: id },
      });

      return ctx.db.laborRepairForm.update({
        where: { id },
        data: {
          ...formData,
          totalCashAdvance,
          cashAdvances: {
            create: cashAdvancesWithBalances,
          },
        },
        include: {
          orderLaborItem: {
            include: {
              orderRequisition: {
                include: {
                  customer: true,
                  contractor: true,
                },
              },
            },
          },
          cashAdvances: {
            orderBy: { date: "asc" },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.laborRepairForm.delete({
        where: { id: input.id },
      });
    }),

  addCashAdvance: protectedProcedure
    .input(
      z.object({
        laborRepairFormId: z.string(),
        date: z.date(),
        amount: z.number().min(0),
        balance: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cashAdvance = await ctx.db.laborRepairFormCashAdvance.create({
        data: input,
      });

      // Update total cash advance in the form
      const allCashAdvances = await ctx.db.laborRepairFormCashAdvance.findMany({
        where: { laborRepairFormId: input.laborRepairFormId },
      });

      const totalCashAdvance = allCashAdvances.reduce(
        (sum, advance) => sum + Number(advance.amount),
        0
      );

      await ctx.db.laborRepairForm.update({
        where: { id: input.laborRepairFormId },
        data: { totalCashAdvance },
      });

      return cashAdvance;
    }),

  updateCashAdvance: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date(),
        amount: z.number().min(0),
        balance: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      const cashAdvance = await ctx.db.laborRepairFormCashAdvance.update({
        where: { id },
        data: updateData,
      });

      // Update total cash advance in the form
      const allCashAdvances = await ctx.db.laborRepairFormCashAdvance.findMany({
        where: { laborRepairFormId: cashAdvance.laborRepairFormId },
      });

      const totalCashAdvance = allCashAdvances.reduce(
        (sum, advance) => sum + Number(advance.amount),
        0
      );

      await ctx.db.laborRepairForm.update({
        where: { id: cashAdvance.laborRepairFormId },
        data: { totalCashAdvance },
      });

      return cashAdvance;
    }),

  deleteCashAdvance: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cashAdvance = await ctx.db.laborRepairFormCashAdvance.findUnique({
        where: { id: input.id },
      });

      if (!cashAdvance) {
        throw new Error("Cash advance not found");
      }

      await ctx.db.laborRepairFormCashAdvance.delete({
        where: { id: input.id },
      });

      // Update total cash advance in the form
      const allCashAdvances = await ctx.db.laborRepairFormCashAdvance.findMany({
        where: { laborRepairFormId: cashAdvance.laborRepairFormId },
      });

      const totalCashAdvance = allCashAdvances.reduce(
        (sum, advance) => sum + Number(advance.amount),
        0
      );

      await ctx.db.laborRepairForm.update({
        where: { id: cashAdvance.laborRepairFormId },
        data: { totalCashAdvance },
      });

      return { success: true };
    }),
});
