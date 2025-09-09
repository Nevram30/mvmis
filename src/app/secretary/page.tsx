"use client";

import DashboardLayout from "~/app/_components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FileText, Calendar, Users, Clock } from "lucide-react";

export default function SecretaryPage() {

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Secretary Dashboard</h1>
              <p className="text-lg text-muted-foreground">Motor Vehicle Management Information System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Order Requisitions Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Order Requisitions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Orders</div>
                <p className="text-xs text-muted-foreground">
                  View, edit, and delete order requisitions
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => (window.location.href = "/secretary/order-requisitions")}
                >
                  View orders
                </Button>
              </CardContent>
            </Card>

            {/* Document Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Document Management</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Documents</div>
                <p className="text-xs text-muted-foreground">
                  Process and organize vehicle documents
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View documents
                </Button>
              </CardContent>
            </Card>

            {/* Appointments Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Schedule & Manage</div>
                <p className="text-xs text-muted-foreground">
                  Coordinate customer appointments
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View appointments
                </Button>
              </CardContent>
            </Card>

            {/* Customer Records Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Records</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Records</div>
                <p className="text-xs text-muted-foreground">
                  Maintain customer information database
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View records
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Today's Tasks */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today&apos;s Tasks
              </CardTitle>
              <CardDescription>Your scheduled tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-yellow-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Process vehicle registration documents
                      </p>
                      <p className="text-sm text-muted-foreground">Due: 2:00 PM</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Mark Complete
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 bg-blue-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Schedule customer appointments
                      </p>
                      <p className="text-sm text-muted-foreground">Due: 4:00 PM</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Mark Complete
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 bg-green-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Update customer database
                      </p>
                      <p className="text-sm text-muted-foreground">Due: End of day</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Mark Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
