"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DollarSign, Users, CheckCircle, Clock, BarChart3, CreditCard, UserCheck, TrendingUp } from "lucide-react";

export default function ProprietorPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout allowedRoles={["PROPRIETOR"]}>
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Proprietor Dashboard</h1>
              <p className="text-lg text-muted-foreground">Motor Vehicle Management Information System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱125,000</div>
                <p className="text-xs text-muted-foreground">
                  +4.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">
                  +18 new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  +12 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
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
                <CardTitle className="text-sm font-medium">Business Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">View Reports</div>
                <p className="text-xs text-muted-foreground">
                  Comprehensive business insights and metrics
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financial Overview</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Finances</div>
                <p className="text-xs text-muted-foreground">
                  Track revenue, expenses, and profitability
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View finances
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Management</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Team</div>
                <p className="text-xs text-muted-foreground">
                  Oversee staff performance and operations
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Manage staff
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Business Activity */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Business Activity
              </CardTitle>
              <CardDescription>Latest business updates and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-green-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        New customer registration completed
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: Maria Rodriguez | Vehicle: 2021 Nissan Sentra
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">2 hours ago</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 bg-blue-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Monthly revenue target achieved
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Target: ₱120,000 | Actual: ₱125,000 (104.2%)
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">1 day ago</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 bg-yellow-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Staff performance review scheduled
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quarterly review for all mechanics and secretary
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">2 days ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
