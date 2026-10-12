export type RoleName = 'Admin' | 'Project Manager'

export type UserAccount = {
  id: string
  name: string
  email: string
  password: string
  role: RoleName
  phone: string
  designation: string
}

export type EmployeeStatus = 'Active' | 'Inactive' | 'Pending'

export type Employee = {
  id: string
  employeeCode: string
  name: string
  email: string
  password: string
  phone: string
  address: string
  designation: string
  department: string
  joiningDate: string
  experience: number
  salary: number
  status: EmployeeStatus
  bankName: string
  accountNumber: string
  branch: string
  pan: string
  aadhaar: string
  emergencyName: string
  emergencyPhone: string
  qualifications: string
}

export type ProjectStatus = 'Active' | 'In Progress' | 'Pending' | 'Completed' | 'Cancelled'

export type ProjectType = 'internal' | 'client'

export type Project = {
  id: string
  type: ProjectType
  name: string
  about: string
  status: ProjectStatus
  expectedBudget: number
  pricePerSqft: number
  startDate: string
  address: string
  amenities: string[]
  progress: number
}

export type AssignmentStatus = 'Active' | 'Pending' | 'Completed'

export type Assignment = {
  id: string
  employeeId: string
  projectId: string
  effectiveDate: string
  status: AssignmentStatus
}

export type StockAlert = {
  id: string
  item: string
  projectId: string
  onHand: string
  reorder: string
}

export type AppNotification = {
  id: string
  title: string
  body: string
  time: string
  read?: boolean
}

export type CashPoint = {
  month: string
  inflow: number
  outflow: number
}

export type TaskItem = {
  id: string
  title: string
  detail: string
}

export type DueBill = {
  id: string
  vendor: string
  project: string
  amount: number
  due: string
}

export type DashboardSeed = {
  followUpsToday: number
  pendingPurchaseRequests: number
  paymentsDue: number
  paymentsDueAmount: number
  lowStock: StockAlert[]
  notifications: AppNotification[]
  trends: {
    projects: number[]
    followUps: number[]
    purchases: number[]
    payments: number[]
  }
  cashflow: CashPoint[]
  tasks: TaskItem[]
  dueBills: DueBill[]
}
