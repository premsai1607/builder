import {
  Building2,
  ClipboardList,
  Contact,
  HardHat,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  Truck,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type NavLink = {
  label: string
  to?: string
  icon: LucideIcon
}

export const sidebarGroups: { label: string; items: NavLink[] }[] = [
  { label: 'Dashboard', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
  {
    label: 'Projects',
    items: [
      { label: 'Projects', to: '/projects', icon: Building2 },
      { label: 'Assign project', to: '/assign', icon: UserPlus },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Customers', icon: Contact },
      { label: 'Follow-ups', icon: ClipboardList },
      { label: 'Bookings', icon: Building2 },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Employees', to: '/employees', icon: Users },
      { label: 'Workers', icon: HardHat },
      { label: 'Contractors', icon: Truck },
      { label: 'Suppliers', icon: Package },
    ],
  },
  {
    label: 'Materials',
    items: [
      { label: 'Items', icon: Package },
      { label: 'Purchase request', icon: ClipboardList },
      { label: 'Stock entry', icon: Package },
      { label: 'Stock issue', icon: Truck },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Income', icon: Wallet },
      { label: 'Expenditure', icon: Wallet },
      { label: 'Advance', icon: Wallet },
      { label: 'Borrowing', icon: Wallet },
      { label: 'Payments', icon: Wallet },
    ],
  },
  { label: 'Settings', items: [
    { label: 'Design system', to: '/design', icon: Palette },
    { label: 'Permissions', icon: Settings },
  ] },
]

export const salesLinks = sidebarGroups.find((group) => group.label === 'Sales')?.items ?? []
export const materialLinks = sidebarGroups.find((group) => group.label === 'Materials')?.items ?? []
export const moreLinks = sidebarGroups.filter((group) => !['Dashboard', 'Sales', 'Materials'].includes(group.label) && group.label !== 'Projects')
