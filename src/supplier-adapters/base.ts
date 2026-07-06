export interface SupplierAdapter {
  id: string;
  name: string;
  baseUrl: string;

  fetchProducts(params: SupplierFetchParams): Promise<SupplierProduct[]>;
  fetchProduct(sku: string): Promise<SupplierProduct | null>;
  syncInventory(): Promise<SupplierSyncResult>;
}

export interface SupplierFetchParams {
  page?: number;
  limit?: number;
  updatedSince?: string;
  category?: string;
}

export interface SupplierProduct {
  sku: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  images: string[];
  categories: string[];
  attributes: Record<string, string>;
}

export interface SupplierSyncResult {
  success: boolean;
  productsSynced: number;
  errors: string[];
  timestamp: string;
}
