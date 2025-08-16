"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { HardHat, Search, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "~/app/_components/dashboard-layout";

interface Contractor {
  id: string;
  contractorName: string;
  address: string;
  telNo?: string;
  mobileNo?: string;
  tin?: string;
  assignment: "OUTSIDE_LABOR" | "INHOUSE";
  createdAt: string;
}

export default function AddContractorPage() {
  const [contractors, setContractors] = useState<Contractor[]>([
    {
      id: "1",
      contractorName: "ABC Construction Co.",
      address: "789 Industrial Ave, City",
      telNo: "123-456-7890",
      mobileNo: "987-654-3210",
      tin: "123-456-789",
      assignment: "OUTSIDE_LABOR",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      contractorName: "XYZ Builders Inc.",
      address: "456 Builder St, Town",
      telNo: "555-123-4567",
      mobileNo: "555-987-6543",
      tin: "987-654-321",
      assignment: "INHOUSE",
      createdAt: "2024-01-20"
    }
  ]);

  const [formData, setFormData] = useState({
    contractorName: "",
    address: "",
    telNo: "",
    mobileNo: "",
    tin: "",
    assignment: "OUTSIDE_LABOR" as "OUTSIDE_LABOR" | "INHOUSE"
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newContractor: Contractor = {
      id: Date.now().toString(),
      contractorName: formData.contractorName,
      address: formData.address,
      ...(formData.telNo.trim() && { telNo: formData.telNo.trim() }),
      ...(formData.mobileNo.trim() && { mobileNo: formData.mobileNo.trim() }),
      ...(formData.tin.trim() && { tin: formData.tin.trim() }),
      assignment: formData.assignment,
      createdAt: new Date().toISOString().split('T')[0]!
    };

    setContractors(prev => [newContractor, ...prev]);
    setFormData({
      contractorName: "",
      address: "",
      telNo: "",
      mobileNo: "",
      tin: "",
      assignment: "OUTSIDE_LABOR"
    });
  };

  const handleDelete = (id: string) => {
    setContractors(prev => prev.filter(contractor => contractor.id !== id));
  };

  const filteredContractors = contractors.filter(contractor =>
    contractor.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ??
    contractor.address.toLowerCase().includes(searchTerm.toLowerCase()) ??
    contractor.tin?.toLowerCase().includes(searchTerm.toLowerCase()) ??
    contractor.assignment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssignmentBadge = (assignment: string) => {
    return assignment === "OUTSIDE_LABOR" ? (
      <Badge variant="outline">Outside Labor</Badge>
    ) : (
      <Badge variant="secondary">Inhouse</Badge>
    );
  };

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Contractor</h1>
            <p className="text-muted-foreground">
              Manage contractor information and records
            </p>
          </div>
        </div>

        {/* Add Contractor Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" />
              Contractor Information
            </CardTitle>
            <CardDescription>
              Enter contractor details to add a new contractor record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractorName">Contractor Name *</Label>
                  <Input
                    id="contractorName"
                    name="contractorName"
                    value={formData.contractorName}
                    onChange={handleInputChange}
                    placeholder="Enter contractor name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telNo">Telephone Number</Label>
                  <Input
                    id="telNo"
                    name="telNo"
                    value={formData.telNo}
                    onChange={handleInputChange}
                    placeholder="Enter telephone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNo">Mobile Number</Label>
                  <Input
                    id="mobileNo"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin">TIN</Label>
                  <Input
                    id="tin"
                    name="tin"
                    value={formData.tin}
                    onChange={handleInputChange}
                    placeholder="Enter TIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignment">Assignment *</Label>
                  <select
                    id="assignment"
                    name="assignment"
                    value={formData.assignment}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="OUTSIDE_LABOR">Outside Labor</option>
                    <option value="INHOUSE">Inhouse</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full md:w-auto">
                <HardHat className="mr-2 h-4 w-4" />
                Add Contractor
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contractor List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contractor Records</CardTitle>
                <CardDescription>
                  View and manage existing contractor records
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {filteredContractors.length} contractors
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contractor Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Tel No</TableHead>
                    <TableHead>Mobile No</TableHead>
                    <TableHead>TIN</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContractors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No contractors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContractors.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell className="font-medium">
                          {contractor.contractorName}
                        </TableCell>
                        <TableCell>{contractor.address}</TableCell>
                        <TableCell>{contractor.telNo ?? "—"}</TableCell>
                        <TableCell>{contractor.mobileNo ?? "—"}</TableCell>
                        <TableCell>{contractor.tin ?? "—"}</TableCell>
                        <TableCell>{getAssignmentBadge(contractor.assignment)}</TableCell>
                        <TableCell>{contractor.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(contractor.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
