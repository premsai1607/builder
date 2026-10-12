import { z } from 'zod'
import { formatNumber } from '@/lib/format'
import type { Employee } from '@/types'

export const employeeSchema = z.object({
  name: z.string().trim().min(2, 'Enter the employee name.'),
  email: z.string().trim().min(1, 'Enter an email address.').email('Enter a valid email address.'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a 10-digit mobile number.'),
  address: z.string().trim().min(3, 'Enter the address.'),
  designation: z.string().min(1, 'Choose a designation.'),
  department: z.string().min(1, 'Choose a department.'),
  joiningDate: z.string().min(1, 'Choose a joining date.'),
  experience: z
    .string()
    .regex(/^\d{1,2}$/, 'Enter years of experience, up to 60.')
    .refine((value) => Number(value) <= 60, 'Enter years of experience, up to 60.'),
  salary: z.string().refine((value) => Number(value.replace(/[^\d]/g, '')) > 0, 'Enter the monthly salary.'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  bankName: z.string().trim().min(2, 'Enter the bank name.'),
  accountNumber: z.string().regex(/^\d{9,18}$/, 'Enter a 9 to 18 digit account number.'),
  branch: z.string().trim().min(2, 'Enter the branch name.'),
  pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Use the PAN format ABCDE1234F.'),
  aadhaar: z.string().regex(/^\d{12}$/, 'Enter a 12-digit Aadhaar number.'),
  emergencyName: z.string().trim().min(2, 'Enter the emergency contact name.'),
  emergencyPhone: z.string().regex(/^\d{10}$/, 'Enter a 10-digit mobile number.'),
  qualifications: z.string(),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

export const formSteps = [
  { label: 'Basic', fields: ['name', 'email', 'phone', 'address'] as const },
  { label: 'Job & salary', fields: ['designation', 'department', 'joiningDate', 'experience', 'salary', 'status'] as const },
  { label: 'Bank & ID', fields: ['bankName', 'accountNumber', 'branch', 'pan', 'aadhaar'] as const },
  { label: 'Emergency', fields: ['emergencyName', 'emergencyPhone'] as const },
  { label: 'Review', fields: [] as const },
]

function today() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function emptyEmployeeValues(): EmployeeFormValues {
  return {
    name: '',
    email: '',
    phone: '',
    address: '',
    designation: '',
    department: '',
    joiningDate: today(),
    experience: '0',
    salary: '',
    status: 'Active',
    bankName: '',
    accountNumber: '',
    branch: '',
    pan: '',
    aadhaar: '',
    emergencyName: '',
    emergencyPhone: '',
    qualifications: '',
  }
}

export function valuesFromEmployee(employee: Employee): EmployeeFormValues {
  return {
    ...emptyEmployeeValues(),
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    address: employee.address,
    designation: employee.designation,
    department: employee.department,
    joiningDate: employee.joiningDate,
    experience: String(employee.experience),
    salary: formatNumber(employee.salary),
    status: employee.status,
    bankName: employee.bankName,
    accountNumber: employee.accountNumber,
    branch: employee.branch,
    pan: employee.pan,
    aadhaar: employee.aadhaar,
    emergencyName: employee.emergencyName,
    emergencyPhone: employee.emergencyPhone,
    qualifications: employee.qualifications,
  }
}

export function readEmployeeDraft(key: string): EmployeeFormValues | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = employeeSchema.partial().safeParse(JSON.parse(raw))
    if (!parsed.success) return null
    return { ...emptyEmployeeValues(), ...parsed.data }
  } catch {
    return null
  }
}
