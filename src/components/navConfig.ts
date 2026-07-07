import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  UserCog,
} from 'lucide-react';
import type { PermissionAction } from '@/types';

export interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionAction | PermissionAction[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:read' },
  { label: 'Products', to: '/products', icon: Package, permission: 'product:read' },
  { label: 'Customers', to: '/customers', icon: Users, permission: 'customer:read' },
  { label: 'Sales', to: '/sales', icon: Receipt, permission: 'sale:read' },
  { label: 'Users', to: '/users', icon: UserCog, permission: 'role:manage' },
];
