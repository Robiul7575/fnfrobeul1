export enum ProductCategory {
  BOLUS = 'Bolus',
  INJECTION = 'Injection',
  LIQUID = 'Liquid',
  POWDER = 'Powder',
  VACCINE = 'Vaccine',
}

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  packSize: string;
  tp: number;
  vat: number;
  tp_vat: number;
  mrp: number;
  bonus: string;
}
