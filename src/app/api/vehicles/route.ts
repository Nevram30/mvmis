import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const createVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  make: z.string().min(1, "Make is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  purchaseDate: z.string().datetime("Invalid purchase date"),
  purchaseCost: z.number().positive("Purchase cost must be positive"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to create vehicle records
    if (session.user.role !== "SECRETARY" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json() as unknown;
    const validatedData = createVehicleSchema.parse(body);

    // Check if plate number already exists
    const existingVehicleByPlate = await db.vehicle.findUnique({
      where: { plateNumber: validatedData.plateNumber },
    });

    if (existingVehicleByPlate) {
      return NextResponse.json(
        { error: "A vehicle with this plate number already exists" },
        { status: 400 }
      );
    }

    // Check if engine number already exists
    const existingVehicleByEngine = await db.vehicle.findUnique({
      where: { engineNumber: validatedData.engineNumber },
    });

    if (existingVehicleByEngine) {
      return NextResponse.json(
        { error: "A vehicle with this engine number already exists" },
        { status: 400 }
      );
    }

    // Create the vehicle record
    const vehicle = await db.vehicle.create({
      data: {
        plateNumber: validatedData.plateNumber.toUpperCase(),
        make: validatedData.make,
        engineNumber: validatedData.engineNumber,
        purchaseDate: new Date(validatedData.purchaseDate),
        purchaseCost: validatedData.purchaseCost,
      },
    });

    return NextResponse.json(
      {
        message: "Vehicle record created successfully",
        vehicle: {
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          make: vehicle.make,
          engineNumber: vehicle.engineNumber,
          purchaseDate: vehicle.purchaseDate,
          purchaseCost: vehicle.purchaseCost,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vehicle:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all vehicles
    const vehicles = await db.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
