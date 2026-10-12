import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { ErrorState, PageFrame } from '@/components/ui/empty-state'
import { DateField, Input, MoneyField, TextArea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ListSkeleton } from '@/components/ui/skeleton'
import { FormStepper } from '@/components/ui/stepper'
import { useData } from '@/context/DataContext'
import { peekEmployeeCode } from '@/lib/db'
import { useEmployeesQuery, useSaveEmployee } from '@/lib/employee-api'
import { formatDate, formatInr, maskAadhaar, maskAccount, maskPan, maskSalary, parseDigits } from '@/lib/format'
import { isAadhaarValid, isEmailValid, isPanValid, isPhoneValid } from '@/lib/validation'
import {
  employeeSchema,
  emptyEmployeeValues,
  formSteps,
  readEmployeeDraft,
  valuesFromEmployee,
  type EmployeeFormValues,
} from '@/pages/employee-schema'
import type { Employee } from '@/types'
import { useUi } from '@/stores/ui'

function draftKey(id?: string) {
  return `buildpro.draft.employee.${id ?? 'new'}`
}

export function EmployeeForm() {
  const { id } = useParams()
  const query = useEmployeesQuery()

  if (query.isPending) {
    return (
      <PageFrame>
        <ListSkeleton />
      </PageFrame>
    )
  }

  if (query.isError) {
    return <ErrorState description="The employee list could not be loaded." onRetry={() => void query.refetch()} />
  }

  const employee = id ? query.data.find((item) => item.id === id) : undefined
  if (id && !employee) {
    return <ErrorState title="Employee not found" description="That record is not on the list anymore." />
  }

  return <EmployeeWizard key={id ?? 'new'} employee={employee} employees={query.data} />
}

function EmployeeWizard({ employee, employees }: { employee?: Employee; employees: Employee[] }) {
  const navigate = useNavigate()
  const save = useSaveEmployee()
  const { departments, designations, addDepartment, addDesignation } = useData()
  const recentDepartments = useUi((state) => state.recentDepartments)
  const recentDesignations = useUi((state) => state.recentDesignations)
  const pushRecentLabel = useUi((state) => state.pushRecentLabel)
  const key = draftKey(employee?.id)
  const [restored] = useState(() => Boolean(readEmployeeDraft(key)))
  const [step, setStep] = useState(0)
  const [more, setMore] = useState(() => Boolean(employee?.qualifications))
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
    defaultValues: readEmployeeDraft(key) ?? (employee ? valuesFromEmployee(employee) : emptyEmployeeValues()),
  })
  const { control, register, watch, trigger, setError, handleSubmit, reset, formState } = form
  const values = watch()
  const code = employee?.employeeCode ?? peekEmployeeCode()

  useEffect(() => {
    const subscription = watch((next) => {
      localStorage.setItem(key, JSON.stringify(next))
    })
    return () => subscription.unsubscribe()
  }, [key, watch])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  async function goNext() {
    const fields = formSteps[step]?.fields
    if (!fields?.length) {
      setStep((current) => Math.min(current + 1, formSteps.length - 1))
      return
    }
    const valid = await trigger([...fields])
    if (valid) setStep((current) => Math.min(current + 1, formSteps.length - 1))
  }

  async function saveEmployee(next: EmployeeFormValues) {
    const duplicate = employees.some(
      (item) => item.email.toLowerCase() === next.email.trim().toLowerCase() && item.id !== employee?.id,
    )
    if (duplicate) {
      setError('email', { message: 'An employee with this email already exists.' })
      setStep(0)
      return
    }
    await save.mutateAsync({
      id: employee?.id,
      values: {
        name: next.name.trim(),
        email: next.email.trim(),
        password: employee?.password ?? '',
        phone: next.phone,
        address: next.address.trim(),
        designation: next.designation,
        department: next.department,
        joiningDate: next.joiningDate,
        experience: Number(next.experience),
        salary: parseDigits(next.salary) ?? 0,
        status: next.status,
        bankName: next.bankName.trim(),
        accountNumber: next.accountNumber,
        branch: next.branch.trim(),
        pan: next.pan.toUpperCase(),
        aadhaar: next.aadhaar,
        emergencyName: next.emergencyName.trim(),
        emergencyPhone: next.emergencyPhone,
        qualifications: next.qualifications.trim(),
      },
    })
    localStorage.removeItem(key)
    navigate('/employees')
  }

  return (
    <PageFrame>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{employee ? 'Edit employee' : 'New employee'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Employee ID <span className="font-medium text-foreground">{code}</span>
        </p>
      </div>
      {restored ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <p>Draft restored. Your last entries are still here.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem(key)
              reset(employee ? valuesFromEmployee(employee) : emptyEmployeeValues())
              setStep(0)
            }}
          >
            Discard draft
          </Button>
        </div>
      ) : null}
      <FormStepper
        steps={formSteps.map((item) => item.label)}
        current={step}
        onStep={(index) => {
          if (index < step) setStep(index)
        }}
      />
      <form
        className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (step < formSteps.length - 1) {
            void goNext()
            return
          }
          void handleSubmit(saveEmployee)()
        }}
        noValidate
      >
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" required {...register('name')} error={formState.errors.name?.message} valid={values.name.trim().length >= 2 && !formState.errors.name} />
            <Input label="Email" required type="email" autoComplete="email" {...register('email')} error={formState.errors.email?.message} valid={isEmailValid(values.email) && !formState.errors.email} />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  label="Phone"
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={formState.errors.phone?.message}
                  valid={isPhoneValid(field.value)}
                />
              )}
            />
            <div className="sm:col-span-2">
              <TextArea label="Address" required {...register('address')} error={formState.errors.address?.message} valid={values.address.trim().length >= 3 && !formState.errors.address} />
            </div>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="designation"
              control={control}
              render={({ field }) => (
                <Select
                  label="Designation"
                  required
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    pushRecentLabel('designation', value)
                  }}
                  options={designations.map((item) => ({ value: item, label: item }))}
                  pinned={recentDesignations.map((item) => ({ value: item, label: item, description: 'Recent' }))}
                  error={formState.errors.designation?.message}
                  valid={Boolean(field.value) && !formState.errors.designation}
                  creatable
                  onCreate={(label) => {
                    addDesignation(label)
                    field.onChange(label)
                    pushRecentLabel('designation', label)
                  }}
                />
              )}
            />
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Select
                  label="Department"
                  required
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    pushRecentLabel('department', value)
                  }}
                  options={departments.map((item) => ({ value: item, label: item }))}
                  pinned={recentDepartments.map((item) => ({ value: item, label: item, description: 'Recent' }))}
                  error={formState.errors.department?.message}
                  valid={Boolean(field.value) && !formState.errors.department}
                  creatable
                  onCreate={(label) => {
                    addDepartment(label)
                    field.onChange(label)
                    pushRecentLabel('department', label)
                  }}
                />
              )}
            />
            <Controller
              name="joiningDate"
              control={control}
              render={({ field }) => (
                <DateField label="Joining date" required value={field.value} onChange={field.onChange} error={formState.errors.joiningDate?.message} valid={Boolean(field.value)} />
              )}
            />
            <Input label="Experience (years)" required inputMode="numeric" {...register('experience')} error={formState.errors.experience?.message} valid={/^\d{1,2}$/.test(values.experience) && Number(values.experience) <= 60} />
            <Controller
              name="salary"
              control={control}
              render={({ field }) => (
                <MoneyField label="Monthly salary" required value={field.value} onChange={field.onChange} error={formState.errors.salary?.message} valid={(parseDigits(field.value) ?? 0) > 0} />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  error={formState.errors.status?.message}
                  valid={Boolean(field.value)}
                />
              )}
            />
          </div>
        ) : null}
        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Bank name" required {...register('bankName')} error={formState.errors.bankName?.message} valid={values.bankName.trim().length >= 2 && !formState.errors.bankName} />
            <Controller
              name="accountNumber"
              control={control}
              render={({ field }) => (
                <Input
                  label="Account number"
                  required
                  secret
                  inputMode="numeric"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 18))}
                  error={formState.errors.accountNumber?.message}
                  valid={/^\d{9,18}$/.test(field.value)}
                />
              )}
            />
            <Input label="Branch" required {...register('branch')} error={formState.errors.branch?.message} valid={values.branch.trim().length >= 2 && !formState.errors.branch} />
            <Controller
              name="pan"
              control={control}
              render={({ field }) => (
                <Input
                  label="PAN"
                  required
                  secret
                  autoCapitalize="characters"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                  error={formState.errors.pan?.message}
                  valid={isPanValid(field.value)}
                  hint="Format ABCDE1234F"
                />
              )}
            />
            <Controller
              name="aadhaar"
              control={control}
              render={({ field }) => (
                <Input
                  label="Aadhaar"
                  required
                  secret
                  inputMode="numeric"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 12))}
                  error={formState.errors.aadhaar?.message}
                  valid={isAadhaarValid(field.value)}
                />
              )}
            />
          </div>
        ) : null}
        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Emergency contact" required {...register('emergencyName')} error={formState.errors.emergencyName?.message} valid={values.emergencyName.trim().length >= 2 && !formState.errors.emergencyName} />
            <Controller
              name="emergencyPhone"
              control={control}
              render={({ field }) => (
                <Input
                  label="Emergency phone"
                  required
                  inputMode="numeric"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={formState.errors.emergencyPhone?.message}
                  valid={isPhoneValid(field.value)}
                />
              )}
            />
            <div className="sm:col-span-2">
              <button type="button" className="text-sm font-medium text-primary-dark" aria-expanded={more} onClick={() => setMore((current) => !current)}>
                {more ? 'Hide details' : 'More details'}
              </button>
              {more ? (
                <div className="mt-3">
                  <TextArea label="Qualifications" optional {...register('qualifications')} />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        {step === 4 ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <ReviewItem label="Employee ID" value={code} />
            <ReviewItem label="Name" value={values.name} />
            <ReviewItem label="Email" value={values.email} />
            <ReviewItem label="Phone" value={values.phone} />
            <ReviewItem label="Address" value={values.address} />
            <ReviewItem label="Designation" value={values.designation} />
            <ReviewItem label="Department" value={values.department} />
            <ReviewItem label="Joining date" value={formatDate(values.joiningDate)} />
            <ReviewItem label="Experience" value={`${values.experience} years`} />
            <ReviewItem label="Salary" value={<Reveal label="salary" value={formatInr(parseDigits(values.salary) ?? 0)} mask={maskSalary()} />} />
            <ReviewItem label="Status" value={values.status} />
            <ReviewItem label="Bank" value={values.bankName} />
            <ReviewItem label="Account" value={<Reveal label="account number" value={values.accountNumber} mask={maskAccount(values.accountNumber)} />} />
            <ReviewItem label="Branch" value={values.branch} />
            <ReviewItem label="PAN" value={<Reveal label="PAN" value={values.pan} mask={maskPan(values.pan)} />} />
            <ReviewItem label="Aadhaar" value={<Reveal label="Aadhaar" value={values.aadhaar} mask={maskAadhaar(values.aadhaar)} />} />
            <ReviewItem label="Emergency contact" value={`${values.emergencyName} · ${values.emergencyPhone}`} />
            <ReviewItem label="Qualifications" value={values.qualifications || '—'} />
          </dl>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Back
          </Button>
          {step < formSteps.length - 1 ? (
            <Button type="submit">Continue</Button>
          ) : (
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save employee'}
            </Button>
          )}
        </div>
      </form>
    </PageFrame>
  )
}

function ReviewItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border pb-3">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm">{value || '—'}</dd>
    </div>
  )
}
