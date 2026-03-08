import { useState, useEffect, useRef, useCallback } from 'react';
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
import { searchCustomers, SavedCustomer, saveCustomer, removeCustomer } from '@/lib/customerHistory';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function AutocompleteInput({
  id,
  value,
  onChange,
  placeholder,
  suggestions,
  onSelect,
  onRemove,
  displayField,
  secondaryField,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  suggestions: SavedCustomer[];
  onSelect: (customer: SavedCustomer) => void;
  onRemove: (customer: SavedCustomer) => void;
  displayField: keyof SavedCustomer;
  secondaryField?: keyof SavedCustomer;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-auto">
          {suggestions.map((customer, i) => (
            <div
              key={i}
              className="flex items-center border-b border-border last:border-0"
            >
              <button
                type="button"
                className="flex-1 text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(customer);
                  setShowSuggestions(false);
                }}
              >
                <div className="font-medium">{String(customer[displayField])}</div>
                {secondaryField && (
                  <div className="text-xs text-muted-foreground">{String(customer[secondaryField])}</div>
                )}
              </button>
              <button
                type="button"
                className="px-2 py-2 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove from history"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(customer);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  const generateOrderNo = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${dateStr}CUM${randomNum}`;
  };

  // Reset and generate new order number when dialog opens
  useEffect(() => {
    if (open) {
      setInfo(prev => ({ ...prev, orderNo: prev.orderNo || generateOrderNo() }));
    }
  }, [open]);

  const updateField = (field: keyof InvoiceInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectCustomer = useCallback((customer: SavedCustomer) => {
    setInfo(prev => ({
      ...prev,
      chemistName: customer.chemistName,
      chemistCode: customer.chemistCode,
      binNo: customer.binNo,
      address: customer.address,
      market: customer.market,
      fieldForce: customer.fieldForce,
      contactNo: customer.contactNo,
      paymentMode: customer.paymentMode,
    }));
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);
  const handleRemoveCustomer = useCallback((customer: SavedCustomer) => {
    removeCustomer(customer.chemistCode, customer.chemistName);
    setRefreshKey(k => k + 1);
  }, []);

  const handleSubmit = () => {
    saveCustomer({
      chemistName: info.chemistName,
      chemistCode: info.chemistCode,
      binNo: info.binNo,
      address: info.address,
      market: info.market,
      fieldForce: info.fieldForce,
      contactNo: info.contactNo,
      paymentMode: info.paymentMode,
    });
    onSubmit(info);
    onOpenChange(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _refresh = refreshKey;
  const nameSuggestions = searchCustomers(info.chemistName, 'chemistName');
  const codeSuggestions = searchCustomers(info.chemistCode, 'chemistCode');

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
              <AutocompleteInput
                id="chemistCode"
                value={info.chemistCode}
                onChange={(val) => updateField('chemistCode', val)}
                placeholder="e.g., CR13000021"
                suggestions={codeSuggestions}
                onSelect={handleSelectCustomer}
                onRemove={handleRemoveCustomer}
                displayField="chemistCode"
                secondaryField="chemistName"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chemistName">Chemist Name *</Label>
              <AutocompleteInput
                id="chemistName"
                value={info.chemistName}
                onChange={(val) => updateField('chemistName', val)}
                placeholder="Enter chemist name"
                suggestions={nameSuggestions}
                onSelect={handleSelectCustomer}
                displayField="chemistName"
                secondaryField="chemistCode"
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
