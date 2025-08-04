"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "~/app/_components/dashboard-layout";

export default function MechanicPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout allowedRoles={["MECHANIC"]}>
      <div className="bg-gray-50 min-h-full">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Mechanic Dashboard</h1>
              <p className="text-sm text-gray-600">Motor Vehicle Management Information System</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Work Orders Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Work Orders</dt>
                        <dd className="text-lg font-medium text-gray-900">Active Jobs</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-orange-700 hover:text-orange-900">
                      View work orders
                    </a>
                  </div>
                </div>
              </div>

              {/* Vehicle Inspections Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Vehicle Inspections</dt>
                        <dd className="text-lg font-medium text-gray-900">Scheduled Inspections</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-orange-700 hover:text-orange-900">
                      View inspections
                    </a>
                  </div>
                </div>
              </div>

              {/* Parts Inventory Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Parts Inventory</dt>
                        <dd className="text-lg font-medium text-gray-900">Check Stock</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-orange-700 hover:text-orange-900">
                      View inventory
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Work Orders */}
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Current Work Orders</h3>
                  <div className="mt-5">
                    <div className="space-y-4">
                      <div className="border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">WO-2025-001</h4>
                            <p className="text-sm text-gray-600">2019 Toyota Camry - Engine Oil Change</p>
                            <p className="text-xs text-gray-500">Customer: John Doe | Plate: ABC-123</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              In Progress
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Started: 9:00 AM</p>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700">
                            Update Status
                          </button>
                          <button className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                            Add Notes
                          </button>
                        </div>
                      </div>

                      <div className="border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">WO-2025-002</h4>
                            <p className="text-sm text-gray-600">2020 Honda Civic - Brake Inspection</p>
                            <p className="text-xs text-gray-500">Customer: Jane Smith | Plate: XYZ-789</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Scheduled
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Start: 11:00 AM</p>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700">
                            Start Work
                          </button>
                          <button className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                            View Details
                          </button>
                        </div>
                      </div>

                      <div className="border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">WO-2025-003</h4>
                            <p className="text-sm text-gray-600">2018 Ford F-150 - Tire Rotation</p>
                            <p className="text-xs text-gray-500">Customer: Mike Johnson | Plate: DEF-456</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Finished: 8:30 AM</p>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                            Generate Report
                          </button>
                          <button className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                            View Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
