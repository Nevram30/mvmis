"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Edit, Trash2, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { api } from "~/trpc/react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { DialogDescription, DialogFooter } from "~/components/ui/dialog";

import LaborRepairFormDialog from "~/components/LaborRepairFormDialog";

export default function ViewOrderReqPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLaborFormOpen, setIsLaborFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
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

  return (
    <DashboardLayout allowedRoles={["PROPRIETOR"]}>
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
            <p className="text-muted-foreground">View and manage vehicle service order requisitions</p>
          </div>
        </div>

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
                              {item.assignment === 'Outside Labor' ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenLaborForm(item)}
                                  className="w-full"
                                >
                                  Create Labor Form
                                </Button>
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
                            onClick={() => handleEditOrder(order.id)}
                          >
                            <Edit className="h-4 w-4" />
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
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Work Order
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Job Order
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No order requisitions found.
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
