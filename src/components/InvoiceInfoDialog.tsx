import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface InvoiceInfo {
  chemistName: string;
  chemistCode: string;
  binNo: string;
  address: string;
  market: string;
  fieldForce: string;
  contactNo: string;
  orderNo: string;
  paymentMode: 'Cash' | 'Credit';
}

interface InvoiceInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (info: InvoiceInfo) => void;
}

export function InvoiceInfoDialog({ open, onOpenChange, onSubmit }: InvoiceInfoDialogProps) {
  const [info, setInfo] = useState<InvoiceInfo>({
    chemistName: '',
    chemistCode: '',
    binNo: '',
    address: '',
    market: '',
    fieldForce: '',
    contactNo: '',
    orderNo: '',
    paymentMode: 'Cash',
  });

  const handleSubmit = () => {
    onSubmit(info);
    onOpenChange(false);
  };

  const updateField = (field: keyof InvoiceInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Generate order number based on current date
  const generateOrderNo = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${dateStr}CUM${randomNum}`;
  };

  // Auto-generate order number if empty when dialog opens
  useState(() => {
    if (!info.orderNo) {
      setInfo(prev => ({ ...prev, orderNo: generateOrderNo() }));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice Information</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row 1: Chemist Code & Chemist Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="chemistCode">Chemist Code</Label>
              <Input
                id="chemistCode"
                value={info.chemistCode}
                onChange={(e) => updateField('chemistCode', e.target.value)}
                placeholder="e.g., CR13000021"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chemistName">Chemist Name *</Label>
              <Input
                id="chemistName"
                value={info.chemistName}
                onChange={(e) => updateField('chemistName', e.target.value)}
                placeholder="Enter chemist name"
              />
            </div>
          </div>

          {/* Row 2: BIN No & Contact No */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="binNo">BIN No</Label>
              <Input
                id="binNo"
                value={info.binNo}
                onChange={(e) => updateField('binNo', e.target.value)}
                placeholder="BIN Number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNo">Contact No</Label>
              <Input
                id="contactNo"
                value={info.contactNo}
                onChange={(e) => updateField('contactNo', e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          {/* Row 3: Address */}
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={info.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Enter address"
            />
          </div>

          {/* Row 4: Market & Field Force */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="market">Market</Label>
              <Input
                id="market"
                value={info.market}
                onChange={(e) => updateField('market', e.target.value)}
                placeholder="e.g., CR130-CHANDPUR"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fieldForce">Field Force</Label>
              <Input
                id="fieldForce"
                value={info.fieldForce}
                onChange={(e) => updateField('fieldForce', e.target.value)}
                placeholder="e.g., V00718-Md.Yousuf Ali Ridoy"
              />
            </div>
          </div>

          {/* Row 5: Order No & Payment Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="orderNo">Order No</Label>
              <Input
                id="orderNo"
                value={info.orderNo}
                onChange={(e) => updateField('orderNo', e.target.value)}
                placeholder="Auto-generated"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select
                value={info.paymentMode}
                onValueChange={(value) => updateField('paymentMode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!info.chemistName.trim()}>
            Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
