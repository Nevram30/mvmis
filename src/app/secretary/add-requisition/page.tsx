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
import { Plus, Trash2, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { api } from "~/trpc/react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { DialogDescription, DialogFooter } from "~/components/ui/dialog";

import LaborRepairFormDialog from "~/components/LaborRepairFormDialog";
import WorkOrderDialog from "~/components/WorkOrderDialog";


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
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrderId] = useState<string>("");
  const [viewOrderId, setViewOrderId] = useState<string>("");
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [selectedLaborItem, setSelectedLaborItem] = useState<{
    id: string;
    itemNumber: number;
    description: string;
    expenses: number | { toNumber(): number };
    mechanic?: string | null;
    assignment?: string | null;
    status?: string | null;
  } | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<{
    id: string;
    generatedOrNumber?: string;
    customer: { customerName: string };
    contractor: { id: string; contractorName: string };
    make: string;
    plateNumber: string;
    engineNumber: string;
    orderDate: string;
    laborItems: Array<{
      id: string;
      itemNumber: number;
      description: string;
      expenses: number | { toNumber(): number };
      mechanic?: string;
      assignment?: string;
    }>;
    materialItems: Array<{
      id: string;
      itemNumber: number;
      quantity?: number;
      description: string;
      expenses: number | { toNumber(): number };
    }>;
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

  // Mutation for deleting order requisition
  const deleteOrderMutation = api.orderRequisition.delete.useMutation({
    onSuccess: () => {
      setNotification({
        type: 'success',
        message: 'Order requisition deleted successfully'
      });
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
      void refetchOrders();
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: `Failed to delete order requisition: ${error.message}`
      });
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    },
  });

  // Query for labor items when editing
  const { data: laborItems, refetch: refetchLaborItems } = api.orderRequisition.getLaborItems.useQuery(
    { orderRequisitionId: selectedOrderId },
    { 
      enabled: !!selectedOrderId && isEditDialogOpen,
      refetchInterval: 5000, // Refetch every 5 seconds when dialog is open
    }
  );

  // Query for viewing order details
  const { data: viewOrder } = api.orderRequisition.getById.useQuery(
    { id: viewOrderId },
    { enabled: !!viewOrderId && isViewDialogOpen }
  );

  // Query for viewing order's labor items
  const { data: viewLaborItems } = api.orderRequisition.getLaborItems.useQuery(
    { orderRequisitionId: viewOrderId },
    { 
      enabled: !!viewOrderId && isViewDialogOpen,
      refetchInterval: 5000, // Refetch every 5 seconds when dialog is open
    }
  );

  // Query to check if labor forms exist for labor items in edit dialog
  const { data: existingLaborForms, refetch: refetchLaborForms } = api.laborRepairForm.getAll.useQuery(
    undefined,
    { enabled: isEditDialogOpen || isViewDialogOpen }
  );

  // Helper function to check if a labor form exists for a labor item
  const hasLaborForm = (laborItemId: string) => {
    return existingLaborForms?.some(form => form.orderLaborItemId === laborItemId) ?? false;
  };

  // Helper function to check if all labor items are approved for an order
  const areAllLaborItemsApproved = (orderId: string) => {
    const order = orders?.find(o => o.id === orderId);
    if (!order || !order.laborItems || order.laborItems.length === 0) {
      return false; // No labor items or order not found
    }
    
    // Check if all labor items are approved
    return order.laborItems.every(item => item.status === 'approved');
  };

  // Helper function to check if any labor item is disapproved for an order
  const hasDisapprovedLaborItems = (orderId: string) => {
    const order = orders?.find(o => o.id === orderId);
    if (!order || !order.laborItems || order.laborItems.length === 0) {
      return false;
    }
    
    // Check if any labor item is disapproved
    return order.laborItems.some(item => item.status === 'disapproved');
  };

  // Debug: Log the labor items data
  console.log("Labor items data:", laborItems);

  // Mutation for updating labor item status
  const updateLaborItemStatusMutation = api.orderRequisition.updateLaborItemStatus.useMutation({
    onSuccess: () => {
      void refetchLaborItems();
    },
  });

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

  // Function to handle opening work order dialog
  const handleOpenWorkOrder = (order: {
    id: string;
    generatedOrNumber?: string | null;
    customer: { customerName: string };
    contractor: { id: string; contractorName: string };
    make: string;
    plateNumber: string;
    engineNumber: string;
    orderDate: string | Date;
    laborItems: Array<{
      id: string;
      itemNumber: number;
      description: string;
      expenses: number | { toNumber(): number };
      mechanic?: string | null;
      assignment?: string | null;
      status?: string | null;
    }>;
    materialItems: Array<{
      id: string;
      description: string;
      createdAt: Date;
      updatedAt: Date;
      itemNumber: number;
      expenses: { toNumber(): number } | number; // Decimal type from database
      quantity: number | null;
      orderRequisitionId: string;
    }>;
  }) => {
    // Convert Date to string if needed and handle null values
    const orderWithStringDate = {
      ...order,
      orderDate: typeof order.orderDate === 'string' ? order.orderDate : order.orderDate.toISOString(),
      generatedOrNumber: order.generatedOrNumber ?? undefined,
      laborItems: order.laborItems.map(item => ({
        ...item,
        mechanic: item.mechanic ?? undefined,
        assignment: item.assignment ?? undefined,
        status: item.status ?? undefined,
      })),
      materialItems: order.materialItems.map(item => ({
        id: item.id,
        itemNumber: item.itemNumber,
        quantity: item.quantity ?? 0, // Handle null quantity
        description: item.description,
        expenses: typeof item.expenses === 'object' && item.expenses !== null && 'toNumber' in item.expenses 
          ? item.expenses 
          : item.expenses, // Handle both Decimal and number types
      })),
    };
    setSelectedWorkOrder(orderWithStringDate);
    setIsWorkOrderDialogOpen(true);
  };

  // Function to handle deleting order requisition
  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    setOrderToDelete({ id: orderId, orderNumber });
    setIsDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrderMutation.mutateAsync({ id: orderToDelete.id });
      } catch (error) {
        console.error("Error deleting order requisition:", error);
      }
    }
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
        {/* Notification */}
        {notification && (
          <Alert
            variant={notification.type === 'error' ? 'destructive' : 'default'}
            className="mb-4"
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {notification.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>
              {notification.message}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={() => setNotification(null)}
            >
              ×
            </Button>
          </Alert>
        )}
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
                            <TableHead className="w-48">Notes</TableHead>
                            <TableHead className="w-40">Remarks</TableHead>
                            <TableHead className="w-40">Status</TableHead>
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
                                <div className="text-sm max-w-48 break-words">
                                  {item.notes ? (
                                    <div className="p-2 bg-muted rounded-md text-xs">
                                      {item.notes}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">No notes</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.assignment === 'Outside Labor' ? (
                                  hasLaborForm(item.id) ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenLaborForm(item)}
                                      className="w-full"
                                      variant="outline"
                                      disabled
                                    >
                                      Labor Form Created
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenLaborForm(item)}
                                      className="w-full"
                                    >
                                      Create Labor Form
                                    </Button>
                                  )
                                ) : item.assignment === 'In-house Labor' ? (
                                  <span className="text-muted-foreground text-sm">No remarks</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No assignment</span>
                                )}
                              </TableCell>
                              <TableCell>
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
            onFormCreated={() => void refetchLaborForms()}
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
                              <TableHead className="w-48">Notes</TableHead>
                              <TableHead className="w-32">Remarks</TableHead>
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
                                  <div className="text-sm max-w-48 break-words">
                                    {item.notes ? (
                                      <div className="p-2 bg-muted rounded-md text-xs">
                                        {item.notes}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">No notes</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.assignment === 'Outside Labor' ? (
                                    hasLaborForm(item.id) ? (
                                      <Button
                                        size="sm"
                                        onClick={() => handleOpenLaborForm(item)}
                                        className="w-full"
                                        variant="outline"
                                        disabled
                                      >
                                        Labor Form Created
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => handleOpenLaborForm(item)}
                                        className="w-full"
                                      >
                                        Create Labor Form
                                      </Button>
                                    )
                                  ) : item.assignment === 'In-house Labor' ? (
                                    <span className="text-muted-foreground text-sm">No remarks</span>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">No assignment</span>
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

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-left">
                  Are you sure you want to delete Order Requisition{" "}
                  <span className="font-semibold">{orderToDelete?.orderNumber}</span>?
                  <br />
                  <br />
                  <span className="text-destructive font-medium">
                    This action cannot be undone.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={deleteOrderMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteOrderMutation.isPending}
                >
                  {deleteOrderMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Work Order Dialog */}
          {selectedWorkOrder && (
            <WorkOrderDialog
              isOpen={isWorkOrderDialogOpen}
              onClose={() => setIsWorkOrderDialogOpen(false)}
              orderRequisition={selectedWorkOrder}
              onWorkOrderCreated={() => void refetchOrders()}
            />
          )}
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
                  <TableHead>Orders</TableHead>
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
                            onClick={() => handleDeleteOrder(order.id, order.generatedOrNumber ?? "System generated")}
                            disabled={deleteOrderMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* Check if customer name contains TCX */}
                        {order.customer.customerName.toUpperCase().includes('TCX') ? (
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="default"
                              size="sm"
                              className={`${
                                hasDisapprovedLaborItems(order.id) 
                                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" 
                                  : areAllLaborItemsApproved(order.id)
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-blue-400 hover:bg-blue-500"
                              }`}
                              disabled={hasDisapprovedLaborItems(order.id) || !areAllLaborItemsApproved(order.id)}
                              onClick={() => areAllLaborItemsApproved(order.id) && !hasDisapprovedLaborItems(order.id) && handleOpenWorkOrder(order)}
                              title={
                                hasDisapprovedLaborItems(order.id) 
                                  ? "Cannot create Work Order - Some labor items are disapproved"
                                  : !areAllLaborItemsApproved(order.id)
                                    ? "Waiting for all labor items to be approved"
                                    : "All labor items approved - Ready to create Work Order"
                              }
                            >
                              Work Order
                            </Button>
                            {hasDisapprovedLaborItems(order.id) && (
                              <span className="text-xs text-red-600">Items disapproved</span>
                            )}
                            {!hasDisapprovedLaborItems(order.id) && !areAllLaborItemsApproved(order.id) && (
                              <span className="text-xs text-yellow-600">Pending approval</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="default"
                              size="sm"
                              className={`${
                                hasDisapprovedLaborItems(order.id) 
                                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" 
                                  : areAllLaborItemsApproved(order.id)
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-green-400 hover:bg-green-500"
                              }`}
                              disabled={hasDisapprovedLaborItems(order.id)}
                              title={
                                hasDisapprovedLaborItems(order.id) 
                                  ? "Cannot create Job Order - Some labor items are disapproved"
                                  : !areAllLaborItemsApproved(order.id)
                                    ? "Waiting for all labor items to be approved"
                                    : "All labor items approved - Ready to create Job Order"
                              }
                            >
                              Job Order
                            </Button>
                            {hasDisapprovedLaborItems(order.id) && (
                              <span className="text-xs text-red-600">Items disapproved</span>
                            )}
                            {!hasDisapprovedLaborItems(order.id) && !areAllLaborItemsApproved(order.id) && (
                              <span className="text-xs text-yellow-600">Pending approval</span>
                            )}
                          </div>
                        )}
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
