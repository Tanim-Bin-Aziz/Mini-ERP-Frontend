export type PermissionAction =
  | 'product:create'
  | 'product:read'
  | 'product:update'
  | 'product:delete'
  | 'customer:create'
  | 'customer:read'
  | 'customer:update'
  | 'customer:delete'
  | 'sale:create'
  | 'sale:read'
  | 'dashboard:read'
  | 'role:manage';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: PermissionAction[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Matches backend's ApiResponse<T> wrapper exactly
export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  unit?: string;
  images?: { url: string; publicId: string }[];
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SaleItem {
  product: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  customer: Customer | string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  lowStockCount: number;
  lowStockProducts: { _id: string; name: string; sku: string; stock: number; category: string }[];
  topSellingProducts: {
    productId: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }[];
  salesOverview: {
    totalSalesCount: number;
    totalGrandTotal: number;
    totalDiscount: number;
    totalTax: number;
    averageOrderValue: number;
  };
}

export interface ApiErrorShape {
  success: false;
  statusCode: number;
  message: string;
  errors?: { path: string; message: string }[];
}
