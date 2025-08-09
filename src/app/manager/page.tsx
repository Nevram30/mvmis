"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Users, ClipboardList, BarChart3, Clock, Settings, UserCheck } from "lucide-react";

export default function ManagerPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout allowedRoles={["MANAGER"]}>
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Manager Dashboard</h1>
              <p className="text-lg text-muted-foreground">Motor Vehicle Management Information System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Operations</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  -3 from yesterday
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Operations Management</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Daily Operations</div>
                <p className="text-xs text-muted-foreground">
                  Oversee daily workflow and processes
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Manage operations
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Oversight</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Team Management</div>
                <p className="text-xs text-muted-foreground">
                  Monitor staff performance and schedules
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View staff
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Monitoring</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Track Metrics</div>
                <p className="text-xs text-muted-foreground">
                  Analyze performance and efficiency metrics
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View performance
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Management Tasks */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Current Management Tasks</CardTitle>
              <CardDescription>Active tasks requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Staff Performance Review
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quarterly review for mechanics and secretary
                    </p>
                    <p className="text-xs text-muted-foreground">Due: End of week</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">In Progress</Badge>
                    <Button size="sm" variant="outline">Continue Review</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Quality Control Audit
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Monthly quality assessment of completed work
                    </p>
                    <p className="text-xs text-muted-foreground">Due: Tomorrow</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">Urgent</Badge>
                    <Button size="sm">Start Audit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Weekly Operations Report
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Compile weekly performance and operations summary
                    </p>
                    <p className="text-xs text-muted-foreground">Completed: Yesterday</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Completed</Badge>
                    <Button size="sm" variant="outline">View Report</Button>
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
