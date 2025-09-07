"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";

interface CashAdvance {
  id?: string;
  date: Date;
  amount: number;
  balance: number;
}

interface LaborRepairFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLaborItem: {
    id: string;
    itemNumber: number;
    description: string;
    expenses: number | { toNumber(): number };
    mechanic?: string | null;
    assignment?: string | null;
    status?: string | null;
  } | null;
}

export default function LaborRepairFormDialog({ 
  isOpen, 
  onClose, 
  selectedLaborItem 
}: LaborRepairFormDialogProps) {
  const [formData, setFormData] = useState({
    contractorName: "",
    make: "",
    plateNumber: "",
    engineNumber: "",
    amount: 0,
    orNumber: "",
    scopeOfWorkDetails: "",
  });

  const [cashAdvances, setCashAdvances] = useState<CashAdvance[]>([
    { date: new Date(), amount: 0, balance: 0 }
  ]);

  // Query to get the order requisition data based on the selected labor item
  const { data: orderRequisitionData } = api.orderRequisition.getByLaborItemId.useQuery(
    { laborItemId: selectedLaborItem?.id ?? "" },
    { 
      enabled: !!selectedLaborItem?.id && isOpen,
      refetchOnWindowFocus: false,
    }
  );

  // Mutation for creating labor repair form
  const createLaborRepairFormMutation = api.laborRepairForm.create.useMutation({
    onSuccess: () => {
      alert("Labor Repair Form created successfully!");
      onClose();
      // Reset form
      setFormData({
        contractorName: "",
        make: "",
        plateNumber: "",
        engineNumber: "",
        amount: 0,
        orNumber: "",
        scopeOfWorkDetails: "",
      });
      setCashAdvances([{ date: new Date(), amount: 0, balance: 0 }]);
    },
    onError: (error) => {
      console.error("Error creating labor repair form:", error);
      alert("Failed to create labor repair form");
    },
  });

  // Initialize form data when selectedLaborItem or orderRequisitionData changes
  useEffect(() => {
    if (selectedLaborItem && isOpen && orderRequisitionData) {
      setFormData({
        contractorName: selectedLaborItem.mechanic ?? orderRequisitionData.contractor.contractorName,
        make: orderRequisitionData.make,
        plateNumber: orderRequisitionData.plateNumber,
        engineNumber: orderRequisitionData.engineNumber,
        amount: 0,
        orNumber: orderRequisitionData.generatedOrNumber ?? "1000000000",
        scopeOfWorkDetails: "",
      });
    }
  }, [selectedLaborItem, isOpen, orderRequisitionData]);

  const handleFormDataChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Recalculate balances when amount changes
    if (field === 'amount') {
      setCashAdvances(prev => calculateBalances(prev));
    }
  };

  const addCashAdvance = () => {
    setCashAdvances(prev => {
      const updated = [
        ...prev,
        { date: new Date(), amount: 0, balance: 0 }
      ];
      return calculateBalances(updated);
    });
  };

  const updateCashAdvance = (index: number, field: keyof CashAdvance, value: Date | number) => {
    setCashAdvances(prev => {
      const updated = prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      );
      
      // Recalculate balances when amount changes
      if (field === 'amount') {
        return calculateBalances(updated);
      }
      
      return updated;
    });
  };

  // Function to calculate running balances
  const calculateBalances = (advances: CashAdvance[]) => {
    let runningBalance = formData.amount; // Start with the total amount
    
    return advances.map((advance, index) => {
      if (index === 0) {
        // First balance = Amount - First cash advance
        runningBalance = formData.amount - advance.amount;
      } else {
        // Subsequent balances = Previous balance - Current cash advance
        runningBalance = runningBalance - advance.amount;
      }
      
      return {
        ...advance,
        balance: runningBalance
      };
    });
  };

  const removeCashAdvance = (index: number) => {
    if (cashAdvances.length > 1) {
      setCashAdvances(prev => {
        const updated = prev.filter((_, i) => i !== index);
        return calculateBalances(updated);
      });
    }
  };

  const calculateTotalCashAdvance = () => {
    return cashAdvances.reduce((sum, advance) => sum + (advance.amount || 0), 0);
  };

  const calculateCashAdvancePercentage = () => {
    const total = calculateTotalCashAdvance();
    if (formData.amount === 0) return 0;
    return (total / formData.amount) * 100;
  };

  const handleSubmit = async () => {
    if (!selectedLaborItem) {
      alert("No labor item selected");
      return;
    }

    if (!formData.contractorName || !formData.make || !formData.plateNumber || !formData.engineNumber) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createLaborRepairFormMutation.mutateAsync({
        orderLaborItemId: selectedLaborItem.id,
        contractorName: formData.contractorName,
        make: formData.make,
        plateNumber: formData.plateNumber,
        engineNumber: formData.engineNumber,
        amount: formData.amount,
        orNumber: formData.orNumber,
        scopeOfWorkDetails: formData.scopeOfWorkDetails,
        cashAdvances: cashAdvances.filter(advance => advance.amount > 0),
      });
    } catch (error) {
      console.error("Error creating labor repair form:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">LABOR REPAIR FORM</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractor">Contractor:</Label>
                  <Input
                    id="contractor"
                    value={formData.contractorName}
                    onChange={(e) => handleFormDataChange('contractorName', e.target.value)}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date:</Label>
                  <Input
                    id="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make:</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleFormDataChange('make', e.target.value)}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount:</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleFormDataChange('amount', parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plateNumber">Plate #:</Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) => handleFormDataChange('plateNumber', e.target.value)}
                    className="font-semibold underline"
                  />
                </div>
                <div>
                  <Label htmlFor="caPercent">CA %:</Label>
                  <Input
                    id="caPercent"
                    value={`${calculateCashAdvancePercentage().toFixed(1)}%`}
                    className={`text-right font-bold ${calculateCashAdvancePercentage() > 50 ? 'text-red-600' : ''}`}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="engine">Engine:</Label>
                  <Input
                    id="engine"
                    value={formData.engineNumber}
                    onChange={(e) => handleFormDataChange('engineNumber', e.target.value)}
                  />
                </div>
                <div></div>
              </div>

              <div>
                <Label htmlFor="orNumber">OR #:</Label>
                <Input
                  id="orNumber"
                  value={formData.orNumber}
                  onChange={(e) => handleFormDataChange('orNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Labor & Services Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">LABOR & SERVICES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center font-semibold">Scope of Work</div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">No.</TableHead>
                      <TableHead className="text-center">DESCRIPTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center">1</TableCell>
                      <TableCell>{selectedLaborItem?.description ?? "Repair"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-4">
                  <Label htmlFor="scopeDetails">Details of the scope of work (editable):</Label>
                  <Textarea
                    id="scopeDetails"
                    value={formData.scopeOfWorkDetails}
                    onChange={(e) => handleFormDataChange('scopeOfWorkDetails', e.target.value)}
                    placeholder="Enter detailed description of the work to be performed..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div className="text-right text-sm space-y-1">
                  <div>The Description copied from the line item description per line item no.</div>
                  <div>Details of the scope of work = free text, manual input</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Advance Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cash Advance</CardTitle>
              <Button onClick={addCashAdvance} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Cash Advance
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Cash Advance<br/>Amount</TableHead>
                    <TableHead className="text-center">Balance</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashAdvances.map((advance, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <Input
                          type="date"
                          value={advance.date.toISOString().split('T')[0]}
                          onChange={(e) => updateCashAdvance(index, 'date', new Date(e.target.value))}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={advance.amount}
                          onChange={(e) => updateCashAdvance(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={advance.balance.toFixed(2)}
                          className="text-right bg-gray-50"
                          readOnly
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCashAdvance(index)}
                          disabled={cashAdvances.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell className="text-center">Total</TableCell>
                    <TableCell className="text-right">{calculateTotalCashAdvance().toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="text-right text-sm space-y-1 mt-4">
                <div>Date = cash advance date</div>
                <div>Amount = editable amount (number only)</div>
                <div>Balance = Amount in the header less line item cash advance then the</div>
                <div>next line item Balance less the next cash advance</div>
                <div className="mt-2">Total = Sum of the total cash advance</div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Section */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <Label>Reviewed by:</Label>
              <div className="mt-2 border-b border-black pb-1">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Current date (auto-filled)
              </div>
            </div>
            <div>
              <Label>Approved by:</Label>
              <div className="mt-2 border-b border-black pb-1">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Current date (auto-filled)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-8">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createLaborRepairFormMutation.isPending}
            >
              {createLaborRepairFormMutation.isPending ? "Saving..." : "Save Labor Form"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
