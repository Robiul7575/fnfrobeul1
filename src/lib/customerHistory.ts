export interface SavedCustomer {
  chemistName: string;
  chemistCode: string;
  binNo: string;
  address: string;
  market: string;
  fieldForce: string;
  contactNo: string;
  paymentMode: 'Cash' | 'Credit';
  lastUsed: number;
}

const STORAGE_KEY = 'fnf-customer-history';
const MAX_CUSTOMERS = 100;

export function getSavedCustomers(): SavedCustomer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomer(customer: Omit<SavedCustomer, 'lastUsed'>): void {
  const customers = getSavedCustomers();
  const existing = customers.findIndex(
    (c) => c.chemistCode === customer.chemistCode && c.chemistName === customer.chemistName
  );

  const entry: SavedCustomer = { ...customer, lastUsed: Date.now() };

  if (existing >= 0) {
    customers[existing] = entry;
  } else {
    customers.unshift(entry);
  }

  // Keep only the most recent entries
  const trimmed = customers
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, MAX_CUSTOMERS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function searchCustomers(query: string, field?: keyof SavedCustomer): SavedCustomer[] {
  if (!query.trim()) return getSavedCustomers().slice(0, 8);
  const lower = query.toLowerCase();
  const customers = getSavedCustomers();

  return customers
    .filter((c) => {
      if (field) {
        return String(c[field]).toLowerCase().includes(lower);
      }
      return (
        c.chemistName.toLowerCase().includes(lower) ||
        c.chemistCode.toLowerCase().includes(lower) ||
        c.contactNo.toLowerCase().includes(lower)
      );
    })
    .slice(0, 8);
}

export function removeCustomer(chemistCode: string, chemistName: string): void {
  const customers = getSavedCustomers().filter(
    (c) => !(c.chemistCode === chemistCode && c.chemistName === chemistName)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}
