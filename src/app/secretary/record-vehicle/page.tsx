"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { CalendarIcon, Car, List, Plus, Edit } from "lucide-react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { api } from "~/trpc/react";

interface VehicleFormData {
  plateNumber: string;
  make: string;
  engineNumber: string;
  purchaseDate: string;
  purchaseCost: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  engineNumber: string;
  purchaseDate: Date;
  purchaseCost: number | { toString(): string };
  createdAt: Date;
}

export default function RecordVehiclePage() {
  const [formData, setFormData] = useState<VehicleFormData>({
    plateNumber: "",
    make: "",
    engineNumber: "",
    purchaseDate: "",
    purchaseCost: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // tRPC hooks
  const { data: vehiclesData, isLoading: isLoadingVehicles, refetch: refetchVehicles } = api.vehicle.getAll.useQuery();
  const createVehicleMutation = api.vehicle.create.useMutation();
  const updateVehicleMutation = api.vehicle.update.useMutation();

  const vehicles = vehiclesData?.vehicles ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditMode(true);
    setFormData({
      plateNumber: vehicle.plateNumber,
      make: vehicle.make,
      engineNumber: vehicle.engineNumber,
      purchaseDate: vehicle.purchaseDate.toISOString().split('T')[0] ?? "",
      purchaseCost: vehicle.purchaseCost.toString(),
    });
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setIsEditMode(false);
    setFormData({
      plateNumber: "",
      make: "",
      engineNumber: "",
      purchaseDate: "",
      purchaseCost: "",
    });
    setIsSheetOpen(true);
  };

  const resetForm = () => {
    setFormData({
      plateNumber: "",
      make: "",
      engineNumber: "",
      purchaseDate: "",
      purchaseCost: "",
    });
    setEditingVehicle(null);
    setIsEditMode(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const wasEditMode = isEditMode;
      
      if (isEditMode && editingVehicle) {
        // Update existing vehicle
        await updateVehicleMutation.mutateAsync({
          id: editingVehicle.id,
          plateNumber: formData.plateNumber,
          make: formData.make,
          engineNumber: formData.engineNumber,
          purchaseDate: new Date(formData.purchaseDate),
          purchaseCost: parseFloat(formData.purchaseCost),
        });
      } else {
        // Create new vehicle
        await createVehicleMutation.mutateAsync({
          plateNumber: formData.plateNumber,
          make: formData.make,
          engineNumber: formData.engineNumber,
          purchaseDate: new Date(formData.purchaseDate),
          purchaseCost: parseFloat(formData.purchaseCost),
        });
      }

      setSuccessMessage(`Vehicle record ${wasEditMode ? "updated" : "created"} successfully! The table below has been updated.`);
      setSuccess(true);
      resetForm();

      // Refresh the vehicles list
      await refetchVehicles();

      // Close the sheet and clear success message after 3 seconds
      setIsSheetOpen(false);
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Vehicle Records Table Motor Vehicle Inventory List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5" />
                <CardTitle>Motor Vehicle Inventory</CardTitle>
              </div>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="flex items-center gap-2" onClick={handleAddNew}>
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{isEditMode ? "Edit Vehicle Information" : "Vehicle Information"}</SheetTitle>
                    <SheetDescription>
                      {isEditMode ? "Update the vehicle details below" : "Please fill in all the required vehicle details below"}
                    </SheetDescription>
                  </SheetHeader>

                  {error && (
                    <Alert className="border-destructive">
                      <AlertDescription className="text-destructive">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="plateNumber">Plate Number</Label>
                        <Input
                          id="plateNumber"
                          name="plateNumber"
                          type="text"
                          placeholder="e.g., ABC-1234"
                          value={formData.plateNumber}
                          onChange={handleInputChange}
                          required
                          className="uppercase"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="make">Make *</Label>
                        <Input
                          id="make"
                          name="make"
                          type="text"
                          placeholder="e.g., Toyota, Honda, Ford"
                          value={formData.make}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="engineNumber">Engine Number</Label>
                      <Input
                        id="engineNumber"
                        name="engineNumber"
                        type="text"
                        placeholder="Enter engine number"
                        value={formData.engineNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="purchaseDate">Registration Date</Label>
                        <div className="relative">
                          <Input
                            id="purchaseDate"
                            name="purchaseDate"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={handleInputChange}
                            required
                          />
                          <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchaseCost">Purchase Cost</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-muted-foreground">₱</span>
                          <Input
                            id="purchaseCost"
                            name="purchaseCost"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.purchaseCost}
                            onChange={handleInputChange}
                            className="pl-8"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-6">
                      <Button
                        type="submit"
                        disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                        className="flex-1"
                      >
                        {isEditMode 
                          ? (updateVehicleMutation.isPending ? "Updating..." : "Update Vehicle Record")
                          : (createVehicleMutation.isPending ? "Creating..." : "Create Vehicle Record")
                        }
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                        disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
            <CardDescription>
              Motor Vehicle Inventory List
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingVehicles ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-muted-foreground">Loading vehicles...</span>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vehicles recorded yet.</p>
                <p className="text-sm">Click the &quot;Add Vehicle&quot; button to record your first vehicle.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Engine Number</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Purchase Cost</TableHead>
                      <TableHead>Date Recorded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          {vehicle.plateNumber}
                        </TableCell>
                        <TableCell>{vehicle.make}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {vehicle.engineNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(vehicle.purchaseDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₱{new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(Number(vehicle.purchaseCost))}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }).format(new Date(vehicle.createdAt))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleEdit(vehicle)}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
