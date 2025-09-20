"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Eye, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { api } from "~/trpc/react";
import DashboardLayout from "~/app/_components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import LaborRepairFormDialog from "~/components/LaborRepairFormDialog";

export default function ViewOrderReqPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLaborFormOpen, setIsLaborFormOpen] = useState(false);
  const [selectedOrderId] = useState<string>("");
  const [viewOrderId, setViewOrderId] = useState<string>("");
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
  const [laborItemNotes, setLaborItemNotes] = useState<Record<string, string>>({});
  
  // Ref to store timeout IDs for debouncing
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const { data: orders } = api.orderRequisition.getAll.useQuery();
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
  const { data: viewLaborItems, refetch: refetchViewLaborItems } = api.orderRequisition.getLaborItems.useQuery(
    { orderRequisitionId: viewOrderId },
    { enabled: !!viewOrderId && isViewDialogOpen }
  );

  // Query for existing labor forms for each labor item
  // We need to use a fixed number of hooks to avoid violating Rules of Hooks
  const laborFormQuery1 = api.laborRepairForm.getByLaborItemId.useQuery(
    { orderLaborItemId: viewLaborItems?.[0]?.id ?? "" },
    { enabled: !!viewLaborItems?.[0]?.id && isViewDialogOpen }
  );
  const laborFormQuery2 = api.laborRepairForm.getByLaborItemId.useQuery(
    { orderLaborItemId: viewLaborItems?.[1]?.id ?? "" },
    { enabled: !!viewLaborItems?.[1]?.id && isViewDialogOpen }
  );
  const laborFormQuery3 = api.laborRepairForm.getByLaborItemId.useQuery(
    { orderLaborItemId: viewLaborItems?.[2]?.id ?? "" },
    { enabled: !!viewLaborItems?.[2]?.id && isViewDialogOpen }
  );
  const laborFormQuery4 = api.laborRepairForm.getByLaborItemId.useQuery(
    { orderLaborItemId: viewLaborItems?.[3]?.id ?? "" },
    { enabled: !!viewLaborItems?.[3]?.id && isViewDialogOpen }
  );
  const laborFormQuery5 = api.laborRepairForm.getByLaborItemId.useQuery(
    { orderLaborItemId: viewLaborItems?.[4]?.id ?? "" },
    { enabled: !!viewLaborItems?.[4]?.id && isViewDialogOpen }
  );

  const laborFormQueries = [laborFormQuery1, laborFormQuery2, laborFormQuery3, laborFormQuery4, laborFormQuery5];

  // Debug: Log the labor items data
  console.log("Labor items data:", laborItems);

  // Mutation for updating labor item status
  const updateLaborItemStatusMutation = api.orderRequisition.updateLaborItemStatus.useMutation({
    onSuccess: () => {
      void refetchLaborItems();
    },
  });

  // Mutation for updating labor item status and notes
  const updateLaborItemStatusAndNotesMutation = api.orderRequisition.updateLaborItemStatusAndNotes.useMutation({
    onSuccess: () => {
      setNotification({
        type: 'success',
        message: 'Labor item updated successfully'
      });
      void refetchLaborItems();
      void refetchViewLaborItems();
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: `Failed to update labor item: ${error.message}`
      });
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    },
  });

  // Mutation for autosaving notes only
  const updateLaborItemNotesMutation = api.orderRequisition.updateLaborItemNotes.useMutation({
    onSuccess: () => {
      // Silent success - no notification for autosave
      void refetchLaborItems();
      void refetchViewLaborItems();
    },
    onError: (error) => {
      console.error("Error autosaving notes:", error);
      // Could show a subtle indicator that autosave failed
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


  // Helper function to get labor form for a specific item
  const getLaborFormForItem = (itemId: string) => {
    const itemIndex = viewLaborItems?.findIndex(item => item.id === itemId) ?? -1;
    if (itemIndex >= 0 && laborFormQueries[itemIndex]) {
      const rawData = laborFormQueries[itemIndex].data;
      if (!rawData) return null;
      
      // Transform the data to match the expected interface
      return {
        contractorName: rawData.contractorName,
        make: rawData.make,
        plateNumber: rawData.plateNumber,
        engineNumber: rawData.engineNumber,
        amount: typeof rawData.amount === 'object' && 'toNumber' in rawData.amount ? rawData.amount.toNumber() : Number(rawData.amount),
        orNumber: rawData.orNumber ?? undefined,
        scopeOfWorkDetails: rawData.scopeOfWorkDetails ?? undefined,
        cashAdvances: rawData.cashAdvances?.map(ca => ({
          id: ca.id,
          date: ca.date,
          amount: typeof ca.amount === 'object' && 'toNumber' in ca.amount ? ca.amount.toNumber() : Number(ca.amount),
          balance: typeof ca.balance === 'object' && 'toNumber' in ca.balance ? ca.balance.toNumber() : Number(ca.balance),
        })) ?? undefined,
      };
    }
    return null;
  };

  // Function to handle approval/disapproval with notes
  const handleApprovalWithNotes = async (laborItemId: string, status: "approved" | "disapproved") => {
    const notes = laborItemNotes[laborItemId] ?? "";
    try {
      await updateLaborItemStatusAndNotesMutation.mutateAsync({
        laborItemId,
        status,
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      console.error("Error updating labor item:", error);
    }
  };

  // Function to handle notes change with autosave
  const handleNotesChange = (laborItemId: string, notes: string) => {
    // Update local state immediately
    setLaborItemNotes(prev => ({
      ...prev,
      [laborItemId]: notes
    }));

    // Clear existing timeout for this labor item
    if (debounceTimeouts.current[laborItemId]) {
      clearTimeout(debounceTimeouts.current[laborItemId]);
    }

    // Set new timeout for autosave
    debounceTimeouts.current[laborItemId] = setTimeout(() => {
      const currentNotes = viewLaborItems?.find(item => item.id === laborItemId)?.notes ?? "";
      if (notes.trim() !== currentNotes) {
        updateLaborItemNotesMutation.mutate({
          laborItemId,
          notes: notes.trim() || undefined,
        });
      }
      // Clean up the timeout reference
      delete debounceTimeouts.current[laborItemId];
    }, 1000); // 1 second delay
  };

  // Function to handle immediate save on Enter key press
  const handleNotesKeyDown = (e: React.KeyboardEvent, laborItemId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      const notes = laborItemNotes[laborItemId] ?? "";
      
      // Save immediately if notes have changed
      if (notes.trim() !== (viewLaborItems?.find(item => item.id === laborItemId)?.notes ?? "")) {
        updateLaborItemNotesMutation.mutate({
          laborItemId,
          notes: notes.trim() || undefined,
        });
        
        // Show a brief success indicator
        setNotification({
          type: 'success',
          message: 'Notes saved'
        });
        // Auto-hide notification after 2 seconds
        setTimeout(() => setNotification(null), 2000);
      }
    }
  };

  // Initialize notes when viewLaborItems changes
  useEffect(() => {
    if (viewLaborItems) {
      const initialNotes: Record<string, string> = {};
      viewLaborItems.forEach(item => {
        initialNotes[item.id] = item.notes ?? "";
      });
      setLaborItemNotes(initialNotes);
    }
  }, [viewLaborItems]);

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
          existingForm={selectedLaborItem ? getLaborFormForItem(selectedLaborItem.id) : null}
        />

        {/* View Order Requisition Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
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
                            <TableHead className="w-32">Labor Form</TableHead>
                            <TableHead className="w-32">Status</TableHead>
                            <TableHead className="w-48">Actions</TableHead>
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
                                <Textarea
                                  placeholder="Add notes... (Press Enter to save)"
                                  value={laborItemNotes[item.id] ?? ""}
                                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                  onKeyDown={(e) => handleNotesKeyDown(e, item.id)}
                                  className="min-h-[60px] text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                {item.assignment === 'Outside Labor' ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenLaborForm(item)}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    View Form
                                  </Button>
                                ) : item.assignment === 'In-house Labor' ? (
                                  <span className="text-muted-foreground text-xs">No form required</span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">No assignment</span>
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
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprovalWithNotes(item.id, "approved")}
                                    disabled={updateLaborItemStatusAndNotesMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 px-2"
                                  >
                                    <ThumbsUp className="h-3 w-3" /> approved
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleApprovalWithNotes(item.id, "disapproved")}
                                    disabled={updateLaborItemStatusAndNotesMutation.isPending}
                                    className="px-2"
                                  >
                                    <ThumbsDown className="h-3 w-3" /> disapproved
                                  </Button>
                                </div>
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
                            <TableCell colSpan={6}></TableCell>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
