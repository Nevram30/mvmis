"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { DollarSign, List, Plus } from "lucide-react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { api } from "~/trpc/react";

interface SellingPriceFormData {
  vehicleId: string;
  sellingPrice: string;
}

export default function RecordSalesPage() {
  const [formData, setFormData] = useState<SellingPriceFormData>({
    vehicleId: "",
    sellingPrice: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // tRPC hooks
  const { data: vehiclesData, isLoading: isLoadingVehicles } = api.vehicle.getAll.useQuery();
  const { data: vehiclesWithSalesData, isLoading: isLoadingSales, refetch: refetchSales } = api.vehicle.getAllWithSellingPrices.useQuery();
  const createSellingPriceMutation = api.vehicle.createSellingPrice.useMutation();

  const vehicles = vehiclesData?.vehicles ?? [];
  const vehiclesWithSales = vehiclesWithSalesData?.vehicles ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleVehicleSelect = (vehicle: { id: string; plateNumber: string; make: string }) => {
    setFormData(prev => ({
      ...prev,
      vehicleId: vehicle.id
    }));
    setSearchTerm(`${vehicle.plateNumber} - ${vehicle.make}`);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setFormData(prev => ({
      ...prev,
      vehicleId: ""
    }));
    setSearchTerm("");
    setShowDropdown(false);
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createSellingPriceMutation.mutateAsync({
        vehicleId: formData.vehicleId,
        sellingPrice: parseFloat(formData.sellingPrice),
      });

      setSuccess(true);
      setFormData({
        vehicleId: "",
        sellingPrice: "",
      });
      setSearchTerm("");
      setShowDropdown(false);

      // Refresh the sales data
      await refetchSales();

      // Close the sheet and clear success message after 3 seconds
      setIsSheetOpen(false);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <AlertDescription className="text-green-700">
              Selling price record created successfully! The table below has been updated.
            </AlertDescription>
          </Alert>
        )}

        {/* Sales Records Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5" />
                <CardTitle>Vehicle Sales Records</CardTitle>
              </div>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Record Sale
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Record Vehicle Sale</SheetTitle>
                    <SheetDescription>
                      Select a vehicle and enter the selling price
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
                    <div className="space-y-2">
                      <Label htmlFor="vehicleSearch">Select Vehicle *</Label>
                      {isLoadingVehicles ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-sm text-muted-foreground">Loading vehicles...</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            id="vehicleSearch"
                            type="text"
                            placeholder="Search by plate number or make..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full"
                            autoComplete="off"
                          />
                          {searchTerm && (
                            <button
                              type="button"
                              onClick={clearSelection}
                              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                            >
                              ✕
                            </button>
                          )}
                          
                          {showDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {filteredVehicles.length > 0 ? (
                                filteredVehicles.map((vehicle) => (
                                  <button
                                    key={vehicle.id}
                                    type="button"
                                    onClick={() => handleVehicleSelect(vehicle)}
                                    className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                                  >
                                    <div className="font-medium">{vehicle.plateNumber}</div>
                                    <div className="text-sm text-muted-foreground">{vehicle.make} • Engine: {vehicle.engineNumber}</div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No vehicles found matching &ldquo;{searchTerm}&rdquo;
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {!formData.vehicleId && searchTerm && (
                        <p className="text-sm text-muted-foreground">Please select a vehicle from the dropdown</p>
                      )}
                    </div>

                    {selectedVehicle && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Selected Vehicle Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Plate Number:</span>
                            <span className="ml-2 font-medium">{selectedVehicle.plateNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Make:</span>
                            <span className="ml-2">{selectedVehicle.make}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Engine Number:</span>
                            <span className="ml-2 font-mono text-xs">{selectedVehicle.engineNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Purchase Cost:</span>
                            <span className="ml-2">₱{new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(Number(selectedVehicle.purchaseCost))}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">₱</span>
                        <Input
                          id="sellingPrice"
                          name="sellingPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.sellingPrice}
                          onChange={handleInputChange}
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button
                        type="submit"
                        disabled={createSellingPriceMutation.isPending}
                        className="flex-1"
                      >
                        {createSellingPriceMutation.isPending ? "Recording..." : "Record Sale"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                        disabled={createSellingPriceMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
            <CardDescription>
              List of all recorded vehicle sales in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSales ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-muted-foreground">Loading sales records...</span>
              </div>
            ) : vehiclesWithSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sales recorded yet.</p>
                <p className="text-sm">Click the &ldquo;Record Sale&rdquo; button to record your first sale.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead className="text-right">Purchase Cost</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead>Sale Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiclesWithSales
                      .filter(vehicle => vehicle.sellingPrices.length > 0)
                      .flatMap(vehicle => 
                        vehicle.sellingPrices.map(sale => ({
                          ...vehicle,
                          sale
                        }))
                      )
                      .map((record) => {
                        return (
                          <TableRow key={`${record.id}-${record.sale.id}`}>
                            <TableCell className="font-medium">
                              {record.plateNumber}
                            </TableCell>
                            <TableCell>{record.make}</TableCell>
                            <TableCell className="text-right">
                              ₱{new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(Number(record.purchaseCost))}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₱{new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(Number(record.sale.sellingPrice))}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Intl.DateTimeFormat('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }).format(new Date(record.sale.createdAt))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
