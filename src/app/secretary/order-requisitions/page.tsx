"use client";

import { useState } from "react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { Trash2, Eye, Edit, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function OrderRequisitionsPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: orderRequisitions, isLoading, refetch } = api.orderRequisition.getAll.useQuery();
  const deleteOrderMutation = api.orderRequisition.delete.useMutation({
    onSuccess: () => {
      setNotification({
        type: 'success',
        message: 'Order requisition deleted successfully'
      });
      setDeleteDialogOpen(false);
      setSelectedOrderId("");
      setSelectedOrderNumber("");
      void refetch();
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

  const handleDeleteClick = (orderId: string, orderNumber: string) => {
    setSelectedOrderId(orderId);
    setSelectedOrderNumber(orderNumber);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedOrderId) {
      deleteOrderMutation.mutate({ id: selectedOrderId });
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["SECRETARY"]}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">Loading order requisitions...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["SECRETARY"]}>
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  Order Requisitions
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage and track all order requisitions
                </p>
              </div>
              <Button onClick={() => (window.location.href = "/secretary/add-requisition")}>
                Add New Requisition
              </Button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="container mx-auto px-4 pt-6">
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
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>All Order Requisitions</CardTitle>
              <CardDescription>
                View, edit, and manage order requisitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderRequisitions && orderRequisitions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OR Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderRequisitions.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.generatedOrNumber}
                        </TableCell>
                        <TableCell>{order.customer.customerName}</TableCell>
                        <TableCell>{order.contractor.contractorName}</TableCell>
                        <TableCell>
                          {order.make} - {order.plateNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>₱{order.overallTotal.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(order.id, order.generatedOrNumber ?? "N/A")}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No order requisitions found.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => (window.location.href = "/secretary/add-requisition")}
                  >
                    Create First Requisition
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-left">
                Are you sure you want to delete Order Requisition{" "}
                <span className="font-semibold">{selectedOrderNumber}</span>?
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
                onClick={() => setDeleteDialogOpen(false)}
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
      </div>
    </DashboardLayout>
  );
}
