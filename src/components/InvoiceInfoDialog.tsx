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

export interface InvoiceInfo {
  chemistName: string;
  chemistCode: string;
  address: string;
  market: string;
  fieldForce: string;
  contactNo: string;
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
    address: '',
    market: '',
    fieldForce: '',
    contactNo: '',
  });

  const handleSubmit = () => {
    onSubmit(info);
    onOpenChange(false);
  };

  const updateField = (field: keyof InvoiceInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invoice Information</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="chemistName">Chemist Name *</Label>
            <Input
              id="chemistName"
              value={info.chemistName}
              onChange={(e) => updateField('chemistName', e.target.value)}
              placeholder="Enter chemist name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="chemistCode">Chemist Code</Label>
              <Input
                id="chemistCode"
                value={info.chemistCode}
                onChange={(e) => updateField('chemistCode', e.target.value)}
                placeholder="e.g., CR15000009"
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

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={info.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Enter address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="market">Market</Label>
            <Input
              id="market"
              value={info.market}
              onChange={(e) => updateField('market', e.target.value)}
              placeholder="e.g., CR150-MOTLAB"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fieldForce">Field Force</Label>
            <Input
              id="fieldForce"
              value={info.fieldForce}
              onChange={(e) => updateField('fieldForce', e.target.value)}
              placeholder="e.g., V00718-Md.Rakibul Hasan"
            />
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
