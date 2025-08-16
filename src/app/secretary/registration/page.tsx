"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { CalendarIcon, FileCheck, Plus, CheckCircle2 } from "lucide-react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { api } from "~/trpc/react";

interface RegistrationFormData {
  vehicleId: string;
  soldTo: string;
  registrationDate: string;
  vehicleMake: string;
  vehicleEngineNumber: string;
  statusChecklist: {
    deedOfSale: boolean;
    id: boolean;
    mayorPermit: boolean;
  };
}

const StatusBadge = ({ checked, label }: { checked: boolean; label: string }) => (
  <Badge variant={checked ? "default" : "secondary"} className={checked ? "bg-green-600" : ""}>
    {checked ? "✓" : "✗"} {label}
  </Badge>
);

export default function RegistrationPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    vehicleId: "",
    soldTo: "",
    registrationDate: "",
    vehicleMake: "",
    vehicleEngineNumber: "",
    statusChecklist: {
      deedOfSale: false,
      id: false,
      mayorPermit: false,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // tRPC hooks
  const { data: vehiclesData } = api.vehicle.getAll.useQuery();
  const { data: registrationsData, isLoading: isLoadingRegistrations, refetch: refetchRegistrations } = api.registration.getAll.useQuery();
  const createRegistrationMutation = api.registration.create.useMutation();

  const vehicles = vehiclesData?.vehicles ?? [];
  const registrations = registrationsData?.registrations ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehicleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value;
    const selectedVehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    
    setFormData(prev => ({
      ...prev,
      vehicleId: vehicleId,
      vehicleMake: selectedVehicle?.make ?? "",
      vehicleEngineNumber: selectedVehicle?.engineNumber ?? "",
    }));
  };

  const handleCheckboxChange = (checkboxName: keyof typeof formData.statusChecklist, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      statusChecklist: {
        ...prev.statusChecklist,
        [checkboxName]: checked,
      }
    }));
  };

  const isAllStatusChecked = () => {
    return formData.statusChecklist.deedOfSale && 
           formData.statusChecklist.id && 
           formData.statusChecklist.mayorPermit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that all status items are checked
    if (!isAllStatusChecked()) {
      setError("All status items must be checked before submitting");
      return;
    }

    try {
      await createRegistrationMutation.mutateAsync({
        vehicleId: formData.vehicleId,
        soldTo: formData.soldTo,
        registrationDate: new Date(formData.registrationDate),
        statusChecklist: formData.statusChecklist,
      });

      setSuccess(true);
      setFormData({
        vehicleId: "",
        soldTo: "",
        registrationDate: "",
        vehicleMake: "",
        vehicleEngineNumber: "",
        statusChecklist: {
          deedOfSale: false,
          id: false,
          mayorPermit: false,
        },
      });

      // Refresh the registrations list
      await refetchRegistrations();

      // Close the sheet and clear success message after 3 seconds
      setIsSheetOpen(false);
      setTimeout(() => {
        setSuccess(false);
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
              Registration record created successfully! The table below has been updated.
            </AlertDescription>
          </Alert>
        )}

        {/* Registration Records Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                <CardTitle>Vehicle Registrations</CardTitle>
              </div>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Registration
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Vehicle Registration</SheetTitle>
                    <SheetDescription>
                      Please fill in all the required registration details below
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
                      <Label htmlFor="vehicleId">Vehicle Plate Number *</Label>
                      <select
                        id="vehicleId"
                        name="vehicleId"
                        value={formData.vehicleId}
                        onChange={handleVehicleSelect}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a vehicle plate number</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Vehicle Make</Label>
                        <Input
                          id="vehicleMake"
                          name="vehicleMake"
                          type="text"
                          placeholder="Auto-filled when vehicle selected"
                          value={formData.vehicleMake}
                          readOnly
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleEngineNumber">Engine Number</Label>
                        <Input
                          id="vehicleEngineNumber"
                          name="vehicleEngineNumber"
                          type="text"
                          placeholder="Auto-filled when vehicle selected"
                          value={formData.vehicleEngineNumber}
                          readOnly
                          className="bg-muted/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="soldTo">Sold To *</Label>
                      <Input
                        id="soldTo"
                        name="soldTo"
                        type="text"
                        placeholder="Enter buyer's name"
                        value={formData.soldTo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationDate">Registration Date *</Label>
                      <div className="relative">
                        <Input
                          id="registrationDate"
                          name="registrationDate"
                          type="date"
                          value={formData.registrationDate}
                          onChange={handleInputChange}
                          required
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-medium">Registration Status Checklist *</Label>
                      <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="deedOfSale"
                            checked={formData.statusChecklist.deedOfSale}
                            onCheckedChange={(checked) => handleCheckboxChange('deedOfSale', checked as boolean)}
                          />
                          <Label htmlFor="deedOfSale" className="text-sm font-normal cursor-pointer">
                            Deed of Sale
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="id"
                            checked={formData.statusChecklist.id}
                            onCheckedChange={(checked) => handleCheckboxChange('id', checked as boolean)}
                          />
                          <Label htmlFor="id" className="text-sm font-normal cursor-pointer">
                            ID
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="mayorPermit"
                            checked={formData.statusChecklist.mayorPermit}
                            onCheckedChange={(checked) => handleCheckboxChange('mayorPermit', checked as boolean)}
                          />
                          <Label htmlFor="mayorPermit" className="text-sm font-normal cursor-pointer">
                            Mayor Permit
                          </Label>
                        </div>
                        {isAllStatusChecked() && (
                          <div className="flex items-center space-x-2 text-green-600 text-sm mt-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>All requirements completed!</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All items must be checked before the registration can be submitted.
                      </p>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button
                        type="submit"
                        disabled={!isAllStatusChecked() || createRegistrationMutation.isPending}
                        className="flex-1"
                      >
                        {createRegistrationMutation.isPending ? "Creating..." : "Create Registration Record"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                        disabled={createRegistrationMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
            <CardDescription>
              List of all vehicle registrations in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRegistrations ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-muted-foreground">Loading registrations...</span>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No registrations recorded yet.</p>
                <p className="text-sm">Click the &quot;Add Registration&quot; button to record your first registration.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Sold To</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Recorded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {/* <Car className="h-4 w-4 text-muted-foreground" /> */}
                            <div>
                              <div className="font-medium">{registration.vehicle.plateNumber}</div>
                              <div className="text-sm text-muted-foreground">{registration.vehicle.make}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{registration.soldTo}</TableCell>
                        <TableCell>
                          {new Date(registration.registrationDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-row gap-1">
                            <StatusBadge checked={registration.deedOfSale} label="Deed of Sale" />
                            <StatusBadge checked={registration.idStatus} label="ID" />
                            <StatusBadge checked={registration.mayorPermit} label="Mayor Permit" />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }).format(new Date(registration.createdAt))}
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
