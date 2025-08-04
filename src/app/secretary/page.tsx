"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "~/app/_components/dashboard-layout";

export default function SecretaryPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="bg-gray-50 min-h-full">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Secretary Dashboard</h1>
              <p className="text-sm text-gray-600">Motor Vehicle Management Information System</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Document Management Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Document Management</dt>
                        <dd className="text-lg font-medium text-gray-900">Manage Documents</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-700 hover:text-blue-900">
                      View documents
                    </a>
                  </div>
                </div>
              </div>

              {/* Appointments Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Appointments</dt>
                        <dd className="text-lg font-medium text-gray-900">Schedule & Manage</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-700 hover:text-blue-900">
                      View appointments
                    </a>
                  </div>
                </div>
              </div>

              {/* Customer Records Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Customer Records</dt>
                        <dd className="text-lg font-medium text-gray-900">Manage Records</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-700 hover:text-blue-900">
                      View records
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Today's Tasks</h3>
                  <div className="mt-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Process vehicle registration documents</p>
                            <p className="text-sm text-gray-500">Due: 2:00 PM</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Mark Complete</button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Schedule customer appointments</p>
                            <p className="text-sm text-gray-500">Due: 4:00 PM</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Mark Complete</button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Update customer database</p>
                            <p className="text-sm text-gray-500">Due: End of day</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Mark Complete</button>
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
