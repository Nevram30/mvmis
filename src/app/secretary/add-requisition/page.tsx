"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { api } from "~/trpc/react";
import DashboardLayout from "~/app/_components/dashboard-layout";

import LaborRepairFormDialog from "~/components/LaborRepairFormDialog";


interface LaborItem {
  itemNumber: number;
  description: string;
  expenses: number;
  assignee?: string;
  contractor?: string;
  assignment?: string;
  status?: string;
}

interface MaterialItem {
  itemNumber: number;
  quantity: number;
  description: string;
  expenses: number;
}

interface OrderFormData {
  customerId: string;
  contractorId: string;
  make: string;
  plateNumber: string;
  engineNumber: string;
  laborItems: LaborItem[];
  materialItems: MaterialItem[];
}

export default function AddRequisitionPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLaborFormOpen, setIsLaborFormOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [viewOrderId, setViewOrderId] = useState<string>("");
  const [selectedLaborItem, setSelectedLaborItem] = useState<{
    id: string;
    itemNumber: number;
    description: string;
    expenses: number | { toNumber(): number };
    mechanic?: string | null;
    assignment?: string | null;
    status?: string | null;
  } | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: "",
    contractorId: "",
    make: "",
    plateNumber: "",
    engineNumber: "",
    laborItems: [{ itemNumber: 1, description: "", expenses: 0, assignee: "", contractor: "", status: "Pending" }],
    materialItems: [{ itemNumber: 1, quantity: 1, description: "", expenses: 0 }],
  });

  const { data: customers } = api.customer.getAll.useQuery();
  const { data: contractors } = api.contractor.getAll.useQuery();
  const { data: orders, refetch: refetchOrders } = api.orderRequisition.getAll.useQuery();
  console.log("orders:", orders);
  
  // Query for labor items when editing
  const { data: laborItems, refetch: refetchLaborItems } = api.orderRequisition.getLaborItems.useQuery(
    { orderRequisitionId: selectedOrderId },
    { enabled: !!selectedOrderId && isEditDialogOpen }
  );

  // Query for viewing order details
  const { data: viewOrder } = api.orderRequisition.getById.useQuery(
    { id: viewOrderId },
    { enabled: !!viewOrderId && isViewDialogOpen }
  );

  // Query for viewing order's labor items
  const { data: viewLaborItems } = api.orderRequisition.getLaborItems.useQuery(
    { orderRequisitionId: viewOrderId },
    { enabled: !!viewOrderId && isViewDialogOpen }
  );

  // Debug: Log the labor items data
  console.log("Labor items data:", laborItems);

  // Mutation for updating labor item status
  const updateLaborItemStatusMutation = api.orderRequisition.updateLaborItemStatus.useMutation({
    onSuccess: () => {
      void refetchLaborItems();
    },
  });

  // Function to handle opening edit dialog
  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsEditDialogOpen(true);
  };

  // Function to handle opening view dialog
  const handleViewOrder = (orderId: string) => {
    setViewOrderId(orderId);
    setIsViewDialogOpen(true);
  };

  // Function to handle status update
  const handleStatusUpdate = async (laborItemId: string, status: "approved" | "disapproved") => {
    try {
      await updateLaborItemStatusMutation.mutateAsync({
        laborItemId,
        status,
      });
    } catch (error) {
      console.error("Error updating labor item status:", error);
      alert("Failed to update status");
    }
  };

  // Function to handle opening labor form
  const handleOpenLaborForm = (laborItem: {
    id: string;
    itemNumber: number;
    description: string;
    expenses: number | { toNumber(): number };
    mechanic?: string | null;
    assignment?: string | null;
    status?: string | null;
  }) => {
    setSelectedLaborItem(laborItem);
    setIsLaborFormOpen(true);
  };


  // Function to handle contractor selection and automatically set assignee
  const handleContractorChange = (laborIndex: number, contractorId: string) => {
    const selectedContractor = contractors?.find(c => c.id === contractorId);
    
    updateLaborItem(laborIndex, 'contractor', contractorId);
    
    if (selectedContractor) {
      // Set the mechanic field to the contractor's name (this is what gets saved to DB)
      updateLaborItem(laborIndex, 'assignee', selectedContractor.contractorName);
      
      // Set the assignment type based on contractor's assignment
      const assignmentText = selectedContractor.assignment === 'OUTSIDE_LABOR' ? 'Outside Labor' : 'In-house Labor';
      updateLaborItem(laborIndex, 'assignment', assignmentText);
    } else {
      // Clear assignee and assignment when no contractor is selected
      updateLaborItem(laborIndex, 'assignee', '');
      updateLaborItem(laborIndex, 'assignment', '');
    }
  };

  
  const createOrderMutation = api.orderRequisition.create.useMutation({
    onSuccess: () => {
      void refetchOrders();
      setIsCreateDialogOpen(false);
      // Reset form
      setFormData({
        customerId: "",
        contractorId: "",
        make: "",
        plateNumber: "",
        engineNumber: "",
        laborItems: [{ itemNumber: 1, description: "", expenses: 0, assignee: "", contractor: "", status: "Pending" }],
        materialItems: [{ itemNumber: 1, quantity: 1, description: "", expenses: 0 }],
      });
    },
  });

  const handleSubmit = async () => {
    if (!formData.customerId || !formData.make || !formData.plateNumber || !formData.engineNumber) {
      alert("Please fill in all required fields");
      return;
    }

    // Set a default contractor for now since it's required by the database but not in the UI
    const defaultContractorId = contractors?.[0]?.id ?? "";
    if (!defaultContractorId) {
      alert("No contractors available. Please add a contractor first.");
      return;
    }

    try {
      // Map the frontend data to match the backend schema
      const mappedLaborItems = formData.laborItems
        .filter(item => item.description.trim() !== "")
        .map(item => ({
          itemNumber: item.itemNumber,
          description: item.description,
          expenses: item.expenses,
          mechanic: item.assignee, // Map assignee to mechanic field
          assignment: item.assignment,
          status: item.status,
        }));

      await createOrderMutation.mutateAsync({
        customerId: formData.customerId,
        contractorId: defaultContractorId,
        make: formData.make,
        plateNumber: formData.plateNumber,
        engineNumber: formData.engineNumber,
        laborItems: mappedLaborItems,
        materialItems: formData.materialItems.filter(item => item.description.trim() !== ""),
      });
    } catch (error) {
      console.error("Error creating order requisition:", error);
      alert("Failed to create order requisition");
    }
  };

  const addLaborItem = () => {
    setFormData(prev => ({
      ...prev,
      laborItems: [...prev.laborItems, {
        itemNumber: prev.laborItems.length + 1,
        description: "",
        expenses: 0,
        assignee: "",
        contractor: "",
        status: "Pending"
      }]
    }));
  };

  const addMaterialItem = () => {
    setFormData(prev => ({
      ...prev,
      materialItems: [...prev.materialItems, {
        itemNumber: prev.materialItems.length + 1,
        quantity: 1,
        description: "",
        expenses: 0
      }]
    }));
  };

  const updateLaborItem = (index: number, field: keyof LaborItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      laborItems: prev.laborItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateMaterialItem = (index: number, field: keyof MaterialItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      materialItems: prev.materialItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeLaborItem = (index: number) => {
    if (formData.laborItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        laborItems: prev.laborItems.filter((_, i) => i !== index)
      }));
    }
  };

  const removeMaterialItem = (index: number) => {
    if (formData.materialItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        materialItems: prev.materialItems.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotalLabor = () => {
    return formData.laborItems.reduce((sum, item) => sum + (item.expenses || 0), 0);
  };

  const calculateTotalMaterial = () => {
    return formData.materialItems.reduce((sum, item) => sum + (item.expenses || 0), 0);
  };

  const calculateOverallTotal = () => {
    return calculateTotalLabor() + calculateTotalMaterial();
  };

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Order Requisitions</h1>
            <p className="text-muted-foreground">Manage vehicle service order requisitions</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Order Requisition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Order Requisition</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="customer">Customer</Label>
                      <select
                        id="customer"
                        className="w-full p-2 border rounded-md"
                        value={formData.customerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                      >
                        <option value="">Select Customer</option>
                        {customers?.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.customerName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="orderDate">Date</Label>
                      <Input
                        id="orderDate"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                        placeholder="e.g., Isuzu Giga"
                      />
                    </div>

                    <div>
                      <Label htmlFor="plateNumber">Plate #</Label>
                      <Input
                        id="plateNumber"
                        value={formData.plateNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                        placeholder="e.g., CAN 8868"
                      />
                    </div>

                    <div>
                      <Label htmlFor="engineNumber">Engine #</Label>
                      <Input
                        id="engineNumber"
                        value={formData.engineNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, engineNumber: e.target.value }))}
                        placeholder="e.g., 6WF1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Labor & Services Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Labor & Services</CardTitle>
                    <Button onClick={addLaborItem} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Item</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-32">Expenses</TableHead>
                          <TableHead className="w-32">Contractor</TableHead>
                          <TableHead className="w-32">Assignee</TableHead>
                          <TableHead className="w-32">Status</TableHead>
                          <TableHead className="w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.laborItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.itemNumber}</TableCell>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => updateLaborItem(index, 'description', e.target.value)}
                                placeholder="e.g., Repair"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.expenses}
                                onChange={(e) => updateLaborItem(index, 'expenses', parseFloat(e.target.value) || 0)}
                              />
                            </TableCell>
                            <TableCell>
                              <select
                                className="w-full p-2 border rounded-md text-sm"
                                value={item.contractor ?? ""}
                                onChange={(e) => handleContractorChange(index, e.target.value)}
                              >
                                <option value="">Select Contractor</option>
                                {contractors?.map((contractor) => (
                                  <option key={contractor.id} value={contractor.id}>
                                    {contractor.contractorName} ({contractor.assignment === 'OUTSIDE_LABOR' ? 'Outside Labor' : 'In-house'})
                                  </option>
                                ))}
                              </select>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {item.assignment ? (
                                  <Badge variant={item.assignment === 'Outside Labor' ? 'secondary' : 'default'}>
                                    {item.assignment}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <Badge variant="secondary">
                                  {item.status ?? "Pending"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLaborItem(index)}
                                disabled={formData.laborItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} className="font-semibold">TOTAL Labor and Services</TableCell>
                          <TableCell className="font-semibold">{calculateTotalLabor().toFixed(2)}</TableCell>
                          <TableCell colSpan={4}></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Parts & Materials Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Parts & Materials</CardTitle>
                    <Button onClick={addMaterialItem} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Item</TableHead>
                          <TableHead className="w-24">QTY.</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-32">Expenses</TableHead>
                          <TableHead className="w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.materialItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.itemNumber}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateMaterialItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                min="1"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => updateMaterialItem(index, 'description', e.target.value)}
                                placeholder="e.g., Parts"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.expenses}
                                onChange={(e) => updateMaterialItem(index, 'expenses', parseFloat(e.target.value) || 0)}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMaterialItem(index)}
                                disabled={formData.materialItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-semibold">TOTAL Parts and Materials</TableCell>
                          <TableCell className="font-semibold">{calculateTotalMaterial().toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Total Section */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          OVER ALL TOTAL: ₱{calculateOverallTotal().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Creating..." : "Create Order Requisition"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Labor Items Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Labor Items Status</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Labor Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {laborItems && laborItems.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Item #</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-32">Expenses</TableHead>
                            <TableHead className="w-32">Contractor</TableHead>
                            <TableHead className="w-32">Assignee</TableHead>
                            <TableHead className="w-40">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {laborItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.itemNumber}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>₱{(typeof item.expenses === 'object' && 'toNumber' in item.expenses ? item.expenses.toNumber() : Number(item.expenses)).toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">
                                  {item.mechanic ?? "-"}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.assignment ? (
                                  <Badge variant={item.assignment === 'Outside Labor' ? 'secondary' : 'default'}>
                                    {item.assignment}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.assignment === 'Outside Labor' ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenLaborForm(item)}
                                    className="w-full"
                                  >
                                    Create Labor Form
                                  </Button>
                                ) : item.assignment === 'In-house Labor' ? (
                                  <Select
                                    value={item.status ?? ""}
                                    onValueChange={(value) => handleStatusUpdate(item.id, value as "approved" | "disapproved")}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approved">Approved</SelectItem>
                                      <SelectItem value="disapproved">Disapproved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No assignment</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No labor items found for this order requisition.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Labor Repair Form Dialog */}
          <LaborRepairFormDialog 
            isOpen={isLaborFormOpen}
            onClose={() => setIsLaborFormOpen(false)}
            selectedLaborItem={selectedLaborItem}
          />

          {/* View Order Requisition Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>View Order Requisition</DialogTitle>
              </DialogHeader>

              {viewOrder && (
                <div className="space-y-6">
                  {/* Header Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>OR Number</Label>
                        <div className="p-2 bg-muted rounded-md">
                          {viewOrder.generatedOrNumber ?? "System generated"}
                        </div>
                      </div>

                      <div>
                        <Label>Customer</Label>
                        <div className="p-2 bg-muted rounded-md">
                          {viewOrder.customer.customerName}
                        </div>
                      </div>

                      <div>
                        <Label>Date</Label>
                        <div className="p-2 bg-muted rounded-md">
                          {new Date(viewOrder.orderDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <Label>Make</Label>
                        <div className="p-2 bg-muted rounded-md">
                          {viewOrder.make}
                        </div>
                      </div>

                      <div>
                        <Label>Plate #</Label>
                        <div className="p-2 bg-muted rounded-md">
                          {viewOrder.plateNumber}
                        </div>
                      </div>

                      <div>
                        <Label>Engine #</Label>
                        <div className="p-2 bg-muted rounded-md">
                          {viewOrder.engineNumber}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Labor & Services Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Labor & Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewLaborItems && viewLaborItems.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Item</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-32">Expenses</TableHead>
                              <TableHead className="w-32">Mechanic</TableHead>
                              <TableHead className="w-32">Assignment</TableHead>
                              <TableHead className="w-32">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewLaborItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.itemNumber}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>₱{(typeof item.expenses === 'object' && 'toNumber' in item.expenses ? item.expenses.toNumber() : Number(item.expenses)).toFixed(2)}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {item.mechanic ?? "-"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.assignment ? (
                                    <Badge variant={item.assignment === 'Outside Labor' ? 'secondary' : 'default'}>
                                      {item.assignment}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={
                                      item.status === 'approved' ? 'default' : 
                                      item.status === 'disapproved' ? 'destructive' : 
                                      'secondary'
                                    }
                                  >
                                    {item.status ?? "Pending"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} className="font-semibold">TOTAL Labor and Services</TableCell>
                              <TableCell className="font-semibold">
                                ₱{viewLaborItems.reduce((sum, item) => 
                                  sum + (typeof item.expenses === 'object' && 'toNumber' in item.expenses ? item.expenses.toNumber() : Number(item.expenses)), 0
                                ).toFixed(2)}
                              </TableCell>
                              <TableCell colSpan={3}></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No labor items found.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Parts & Materials Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Parts & Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewOrder.materialItems && viewOrder.materialItems.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Item</TableHead>
                              <TableHead className="w-24">QTY.</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-32">Expenses</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewOrder.materialItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.itemNumber}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>₱{(typeof item.expenses === 'object' && 'toNumber' in item.expenses ? item.expenses.toNumber() : Number(item.expenses)).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} className="font-semibold">TOTAL Parts and Materials</TableCell>
                              <TableCell className="font-semibold">
                                ₱{viewOrder.materialItems.reduce((sum, item) => 
                                  sum + (typeof item.expenses === 'object' && 'toNumber' in item.expenses ? item.expenses.toNumber() : Number(item.expenses)), 0
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No material items found.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Total Section */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-end">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            OVER ALL TOTAL: ₱{Number(viewOrder.overallTotal).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order Requisitions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OR #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.generatedOrNumber ?? "System generated"}
                      </TableCell>
                      <TableCell>{order.customer.customerName}</TableCell>
                      <TableCell>{order.contractor.contractorName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{order.make}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.plateNumber} • {order.engineNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">₱{Number(order.overallTotal).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditOrder(order.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No order requisitions found. Create your first order requisition to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
