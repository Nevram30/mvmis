"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Printer } from "lucide-react";
import { api } from "~/trpc/react";

interface WorkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderRequisition: {
    id: string;
    customer: { customerName: string };
    contractor: { id: string; contractorName: string };
    make: string;
    plateNumber: string;
    engineNumber: string;
    orderDate: string;
    generatedOrNumber?: string;
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
  };
  onWorkOrderCreated?: () => void;
}

interface WorkOrderItem {
  description: string;
  expenses: number;
  customerBilling: number;
  mechanic: string;
  contractor: string;
  lrfNo: string;
}

interface MaterialItem {
  description: string;
  expenses: number;
  customerBilling: number;
}

export default function WorkOrderDialog({
  isOpen,
  onClose,
  orderRequisition,
  onWorkOrderCreated
}: WorkOrderDialogProps) {
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([]);
  const [laborMultiplier, setLaborMultiplier] = useState(1.75);
  const [partMultiplier, setPartMultiplier] = useState(1.4);

  // Create work order mutation
  const createWorkOrderMutation = api.workOrder.create.useMutation({
    onSuccess: () => {
      onWorkOrderCreated?.();
      onClose();
    },
    onError: (error: unknown) => {
      console.error("Error creating work order:", error);
      alert("Failed to create work order");
    },
  });

  // Initialize items when dialog opens
  useEffect(() => {
    if (isOpen && orderRequisition) {
      // Initialize labor items
      const laborItems = orderRequisition.laborItems.map((item) => {
        const expenses = typeof item.expenses === 'object' && 'toNumber' in item.expenses 
          ? item.expenses.toNumber() 
          : Number(item.expenses);
        
        return {
          description: item.description,
          expenses: expenses,
          customerBilling: expenses * laborMultiplier,
          mechanic: item.mechanic ?? '',
          contractor: item.assignment ?? '',
          lrfNo: `200000000${item.itemNumber}`, // Generate LRF number
        };
      });

      // Initialize material items
      const materials = orderRequisition.materialItems.map((item) => {
        const expenses = typeof item.expenses === 'object' && 'toNumber' in item.expenses 
          ? item.expenses.toNumber() 
          : Number(item.expenses);
        
        return {
          description: item.description,
          expenses: expenses,
          customerBilling: expenses * partMultiplier,
        };
      });

      setWorkOrderItems(laborItems);
      setMaterialItems(materials);
    }
  }, [isOpen, orderRequisition, laborMultiplier, partMultiplier]);

  // Calculate totals
  const calculateLaborTotal = () => {
    return workOrderItems.reduce((sum, item) => sum + item.expenses, 0);
  };

  const calculateLaborCustomerBilling = () => {
    return workOrderItems.reduce((sum, item) => sum + item.customerBilling, 0);
  };

  const calculateMaterialTotal = () => {
    return materialItems.reduce((sum, item) => sum + item.expenses, 0);
  };

  const calculateMaterialCustomerBilling = () => {
    return materialItems.reduce((sum, item) => sum + item.customerBilling, 0);
  };

  const calculateOverallTotal = () => {
    return calculateLaborTotal() + calculateMaterialTotal();
  };

  const calculateOverallCustomerBilling = () => {
    return calculateLaborCustomerBilling() + calculateMaterialCustomerBilling();
  };

  const calculateDifference = () => {
    return calculateOverallTotal() - calculateOverallCustomerBilling();
  };

  // Update labor item customer billing when multiplier changes
  const updateLaborMultiplier = (newMultiplier: number) => {
    setLaborMultiplier(newMultiplier);
    setWorkOrderItems(prev => prev.map(item => ({
      ...item,
      customerBilling: item.expenses * newMultiplier
    })));
  };

  // Update material item customer billing when multiplier changes
  const updatePartMultiplier = (newMultiplier: number) => {
    setPartMultiplier(newMultiplier);
    setMaterialItems(prev => prev.map(item => ({
      ...item,
      customerBilling: item.expenses * newMultiplier
    })));
  };

  // Handle save work order
  const handleSave = async () => {
    try {
      if (!orderRequisition.laborItems || orderRequisition.laborItems.length === 0) {
        alert("No labor items found");
        return;
      }

      await createWorkOrderMutation.mutateAsync({
        orderRequisitionId: orderRequisition.id,
        contractorId: orderRequisition.contractor.id,
        // laborRepairId is now optional, so we don't need to pass it
        customerBilling: calculateOverallCustomerBilling(),
        expenses: calculateOverallTotal(),
      });
    } catch (error) {
      console.error("Error saving work order:", error);
    }
  };

  // Handle print work order
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Work Order - ${orderRequisition.customer.customerName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              border-bottom: 1px solid #000;
              padding-bottom: 2px;
            }
            .info-label {
              font-weight: bold;
              margin-right: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            .total-row {
              font-weight: bold;
            }
            .section-title {
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              margin: 20px 0 10px 0;
            }
            .totals-section {
              text-align: right;
              margin: 20px 0;
            }
            .totals-section div {
              margin: 5px 0;
            }
            .notes-section {
              margin-top: 20px;
              font-size: 10px;
            }
            .pricing-info {
              text-align: right;
              margin: 10px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">WORK ORDER</div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Customer:</span>
              ${orderRequisition.customer.customerName}
            </div>
            <div class="info-item">
              <span class="info-label">Date:</span>
              ${new Date(orderRequisition.orderDate).toLocaleDateString()}
            </div>
            <div class="info-item">
              <span class="info-label">WO #:</span>
              3000000000
            </div>
            <div class="info-item">
              <span class="info-label">Make:</span>
              ${orderRequisition.make}
            </div>
            <div class="info-item">
              <span class="info-label">Plate #:</span>
              ${orderRequisition.plateNumber}
            </div>
            <div class="info-item">
              <span class="info-label">OR #:</span>
              ${orderRequisition.generatedOrNumber ?? "1000000000"}
            </div>
            <div class="info-item">
              <span class="info-label">Engine:</span>
              ${orderRequisition.engineNumber}
            </div>
          </div>

          <div class="section-title">LABOR & SERVICES</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Item</th>
                <th>DESCRIPTION</th>
                <th style="width: 100px;">Expenses</th>
                <th style="width: 120px;">Customer Billing</th>
                <th style="width: 100px;">Mechanic</th>
                <th style="width: 100px;">Contractor</th>
                <th style="width: 100px;">LRF No.</th>
              </tr>
            </thead>
            <tbody>
              ${workOrderItems.map((item, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td>${item.description}</td>
                  <td style="text-align: right;">₱${item.expenses.toFixed(2)}</td>
                  <td style="text-align: right;">₱${item.customerBilling.toFixed(2)}</td>
                  <td>${item.mechanic}</td>
                  <td>${item.contractor}</td>
                  <td>${item.lrfNo}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2" style="text-align: center;">TOTAL:</td>
                <td style="text-align: right;">₱${calculateLaborTotal().toFixed(2)}</td>
                <td style="text-align: right;">₱${calculateLaborCustomerBilling().toFixed(2)}</td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">PARTS & MATERIALS</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Item</th>
                <th style="width: 60px;">QTY.</th>
                <th>DESCRIPTION</th>
                <th style="width: 100px;">Expenses</th>
                <th style="width: 120px;">Customer Billing</th>
              </tr>
            </thead>
            <tbody>
              ${materialItems.map((item, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td style="text-align: center;">1</td>
                  <td>${item.description}</td>
                  <td style="text-align: right;">₱${item.expenses.toFixed(2)}</td>
                  <td style="text-align: right;">₱${item.customerBilling.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: center;">TOTAL:</td>
                <td style="text-align: right;">₱${calculateMaterialTotal().toFixed(2)}</td>
                <td style="text-align: right;">₱${calculateMaterialCustomerBilling().toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-section">
            <div><strong>OVER ALL TOTAL: ₱${calculateOverallTotal().toFixed(2)}</strong></div>
            <div><strong>Customer Billing: ₱${calculateOverallCustomerBilling().toFixed(2)}</strong></div>
            <div><strong>Difference: (₱${Math.abs(calculateDifference()).toFixed(2)})</strong></div>
          </div>

          <div class="pricing-info">
            <div>Pricing Table (manual maintenance)</div>
            <div>Labor = ${laborMultiplier}</div>
            <div>Part = ${partMultiplier}</div>
          </div>

          <div class="notes-section">
            <div>Suggest to create a table maintenance for percentage multiple to rate to set the amount in customer billing</div>
            <div>The same computation for the parts and materials</div>
            <br>
            <div>Secretary - Create / Change / display</div>
            <div>Manager - change / display</div>
            <div>Proprietor - Change / display / Approval</div>
            <br>
            <div>Difference = total of overall expense - overall customer billing</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  if (!orderRequisition) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">WORK ORDER</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Information */}
          <div className="grid grid-cols-6 gap-4 text-sm">
            <div>
              <Label className="font-semibold">Customer:</Label>
              <div className="border-b border-black">{orderRequisition.customer.customerName}</div>
            </div>
            <div>
              <Label className="font-semibold">Date:</Label>
              <div className="border-b border-black">
                {new Date(orderRequisition.orderDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <Label className="font-semibold">WO #:</Label>
              <div className="border-b border-black">3000000000</div>
            </div>
            <div>
              <Label className="font-semibold">1.4</Label>
            </div>
            <div>
              <Label className="font-semibold">Make:</Label>
              <div className="border-b border-black">{orderRequisition.make}</div>
            </div>
            <div>
              <Label className="font-semibold">1.75</Label>
            </div>
            <div>
              <Label className="font-semibold">Plate #:</Label>
              <div className="border-b border-black">{orderRequisition.plateNumber}</div>
            </div>
            <div>
              <Label className="font-semibold">OR #:</Label>
              <div className="border-b border-black">
                {orderRequisition.generatedOrNumber ?? "1000000000"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">Engine:</Label>
              <div className="border-b border-black">{orderRequisition.engineNumber}</div>
            </div>
          </div>

          {/* Labor & Services Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">LABOR & SERVICES</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Item</TableHead>
                    <TableHead>DESCRIPTION</TableHead>
                    <TableHead className="w-24">expenses</TableHead>
                    <TableHead className="w-32">customer billing</TableHead>
                    <TableHead className="w-24">Mechanic</TableHead>
                    <TableHead className="w-24">Contractor</TableHead>
                    <TableHead className="w-24">LRF No.</TableHead>
                    <TableHead className="w-48">Current Billing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>₱{item.expenses.toFixed(2)}</TableCell>
                      <TableCell>₱{item.customerBilling.toFixed(2)}</TableCell>
                      <TableCell>{item.mechanic}</TableCell>
                      <TableCell>{item.contractor}</TableCell>
                      <TableCell>{item.lrfNo}</TableCell>
                      <TableCell className="text-xs">
                        Current Billing = {item.expenses.toFixed(0)} x {laborMultiplier}<br/>
                        to get the {item.customerBilling.toFixed(0)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell colSpan={2}>TOTAL:</TableCell>
                    <TableCell>₱{calculateLaborTotal().toFixed(2)}</TableCell>
                    <TableCell>₱{calculateLaborCustomerBilling().toFixed(2)}</TableCell>
                    <TableCell colSpan={4}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Parts & Materials Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">PARTS & MATERIALS</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Item</TableHead>
                    <TableHead className="w-16">QTY.</TableHead>
                    <TableHead>DESCRIPTION</TableHead>
                    <TableHead className="w-24">expenses</TableHead>
                    <TableHead className="w-32">customer billing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>₱{item.expenses.toFixed(2)}</TableCell>
                      <TableCell>₱{item.customerBilling.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell colSpan={3}>TOTAL:</TableCell>
                    <TableCell>₱{calculateMaterialTotal().toFixed(2)}</TableCell>
                    <TableCell>₱{calculateMaterialCustomerBilling().toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totals Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-right">
                <div></div>
                <div className="font-semibold">
                  <div>OVER ALL TOTAL:</div>
                  <div>Difference</div>
                </div>
                <div className="font-semibold">
                  <div>₱{calculateOverallTotal().toFixed(2)}</div>
                  <div>₱{calculateOverallCustomerBilling().toFixed(2)}</div>
                  <div>(₱{Math.abs(calculateDifference()).toFixed(2)})</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="laborMultiplier">Labor Multiplier</Label>
                <Input
                  id="laborMultiplier"
                  type="number"
                  step="0.01"
                  value={laborMultiplier}
                  onChange={(e) => updateLaborMultiplier(parseFloat(e.target.value) || 1.75)}
                />
              </div>
              <div>
                <Label htmlFor="partMultiplier">Part Multiplier</Label>
                <Input
                  id="partMultiplier"
                  type="number"
                  step="0.01"
                  value={partMultiplier}
                  onChange={(e) => updatePartMultiplier(parseFloat(e.target.value) || 1.4)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm space-y-2">
                <div>Suggest to create a table maintenance for percentage multiple to rate to set the amount in customer billing</div>
                <div>The same computation for the parts and materials</div>
                <div className="text-right">
                  <div>Pricing Table ( manual maintenance )</div>
                  <div>Labor = {laborMultiplier}</div>
                  <div>Part = {partMultiplier}</div>
                </div>
                <div className="mt-4">
                  <div>Secretary - Create / Change / display</div>
                  <div>Manager - change / display</div>
                  <div>Proprietor - Change / display / Approval</div>
                </div>
                <div className="mt-4 text-right">
                  <div>Difference = total of overall expense - overall customer billing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="secondary"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Work Order
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createWorkOrderMutation?.isPending}
            >
              {createWorkOrderMutation?.isPending ? "Saving..." : "Save Work Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
