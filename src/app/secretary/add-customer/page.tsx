"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { UserPlus, Search, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { api } from "~/trpc/react";

export default function AddCustomerPage() {
  const { data: customers, refetch: refetchCustomers } = api.customer.getAll.useQuery();
  const createCustomerMutation = api.customer.create.useMutation({
    onSuccess: () => {
      void refetchCustomers();
      setFormData({
        customerName: "",
        address: "",
        telNo: "",
        mobileNo: "",
        tin: ""
      });
    },
  });
  const deleteCustomerMutation = api.customer.delete.useMutation({
    onSuccess: () => {
      void refetchCustomers();
    },
  });

  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    telNo: "",
    mobileNo: "",
    tin: ""
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCustomerMutation.mutateAsync({
        customerName: formData.customerName,
        address: formData.address,
        telNo: formData.telNo.trim() === '' ? undefined : formData.telNo.trim(),
        mobileNo: formData.mobileNo.trim() === '' ? undefined : formData.mobileNo.trim(),
        tin: formData.tin.trim() === '' ? undefined : formData.tin.trim(),
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomerMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  const filteredCustomers = customers?.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.tin?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Customer</h1>
            <p className="text-muted-foreground">
              Manage customer information and records
            </p>
          </div>
        </div>

        {/* Add Customer Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Enter customer details to add a new customer record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
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
              </div>
              <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={createCustomerMutation.isPending}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {createCustomerMutation.isPending ? "Adding..." : "Add Customer"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Records</CardTitle>
                <CardDescription>
                  View and manage existing customer records
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {filteredCustomers.length} customers
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Tel No</TableHead>
                    <TableHead>Mobile No</TableHead>
                    <TableHead>TIN</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.customerName}
                        </TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>{customer.telNo ?? "—"}</TableCell>
                        <TableCell>{customer.mobileNo ?? "—"}</TableCell>
                        <TableCell>{customer.tin ?? "—"}</TableCell>
                        <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={deleteCustomerMutation.isPending}
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
