"use client";

import DashboardLayout from "~/app/_components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ClipboardList, CheckCircle, Package, Wrench } from "lucide-react";

export default function MechanicPage() {
  return (
    <DashboardLayout allowedRoles={["MECHANIC"]}>
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Mechanic Dashboard</h1>
              <p className="text-lg text-muted-foreground">Motor Vehicle Management Information System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Work Orders Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active Jobs</div>
                <p className="text-xs text-muted-foreground">
                  Manage your assigned work orders
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View work orders
                </Button>
              </CardContent>
            </Card>

            {/* Vehicle Inspections Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicle Inspections</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Scheduled Inspections</div>
                <p className="text-xs text-muted-foreground">
                  Perform vehicle safety inspections
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View inspections
                </Button>
              </CardContent>
            </Card>

            {/* Parts Inventory Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parts Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Check Stock</div>
                <p className="text-xs text-muted-foreground">
                  Monitor parts availability and usage
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View inventory
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Work Orders */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Current Work Orders
              </CardTitle>
              <CardDescription>Your active and scheduled work assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">WO-2025-001</h4>
                        <Badge variant="secondary">In Progress</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        2019 Toyota Camry - Engine Oil Change
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Customer: John Doe | Plate: ABC-123 | Started: 9:00 AM
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Update Status</Button>
                      <Button size="sm" variant="outline">Add Notes</Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">WO-2025-002</h4>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        2020 Honda Civic - Brake Inspection
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Customer: Jane Smith | Plate: XYZ-789 | Start: 11:00 AM
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Start Work</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">WO-2025-003</h4>
                        <Badge variant="default">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        2018 Ford F-150 - Tire Rotation
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Customer: Mike Johnson | Plate: DEF-456 | Finished: 8:30 AM
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="default">Generate Report</Button>
                      <Button size="sm" variant="outline">View Report</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
