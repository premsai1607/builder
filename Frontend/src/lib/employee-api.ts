import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { db, peekEmployeeCode, type Store } from '@/lib/db'
import { wait } from '@/lib/delay'
import type { Employee } from '@/types'

export const employeeKey = ['employees'] as const

async function loadEmployees() {
  await wait()
  return db.listEmployees()
}

export function useEmployeesQuery() {
  return useQuery({
    queryKey: employeeKey,
    queryFn: loadEmployees,
  })
}

function duplicateEmail(email: string, ignoreId?: string) {
  return db
    .listEmployees()
    .some((employee) => employee.email.toLowerCase() === email.trim().toLowerCase() && employee.id !== ignoreId)
}

export function useSaveEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id?: string; values: Omit<Employee, 'id' | 'employeeCode'> }) => {
      await wait(280)
      if (duplicateEmail(input.values.email, input.id)) {
        throw new Error('An employee with this email already exists.')
      }
      if (input.id) {
        const saved = db.updateEmployee(input.id, input.values)
        if (!saved) throw new Error('That employee is no longer on the list.')
        return { employee: saved, created: false }
      }
      return { employee: db.addEmployee(input.values), created: true }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: employeeKey })
      const previous = queryClient.getQueryData<Employee[]>(employeeKey)
      const tempId = input.id ?? `tmp-${Date.now()}`
      const optimistic: Employee = {
        ...input.values,
        id: tempId,
        employeeCode: input.id
          ? (previous?.find((employee) => employee.id === input.id)?.employeeCode ?? peekEmployeeCode())
          : peekEmployeeCode(),
      }
      queryClient.setQueryData<Employee[]>(employeeKey, (rows) => {
        const current = rows ?? []
        if (input.id) return current.map((employee) => (employee.id === input.id ? optimistic : employee))
        return [optimistic, ...current]
      })
      return { previous, tempId }
    },
    onError: (error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(employeeKey, context.previous)
      toast.error(error instanceof Error ? error.message : 'Could not save the employee.')
    },
    onSuccess: (result, _input, context) => {
      queryClient.setQueryData<Employee[]>(employeeKey, (rows) =>
        (rows ?? []).map((employee) => (employee.id === context?.tempId || employee.id === result.employee.id ? result.employee : employee)),
      )
      toast.success(result.created ? `${result.employee.name} added` : `${result.employee.name} updated`, {
        action: {
          label: 'Undo',
          onClick: () => {
            if (result.created) {
              db.removeEmployee(result.employee.id)
              queryClient.setQueryData<Employee[]>(employeeKey, (rows) => (rows ?? []).filter((employee) => employee.id !== result.employee.id))
              return
            }
            const previous = context?.previous?.find((employee) => employee.id === result.employee.id)
            if (!previous) return
            db.updateEmployee(previous.id, previous)
            queryClient.setQueryData<Employee[]>(employeeKey, context?.previous)
          },
        },
      })
    },
  })
}

export function usePatchEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<Omit<Employee, 'id' | 'employeeCode'>> }) => {
      await wait(220)
      const saved = db.updateEmployee(input.id, input.patch)
      if (!saved) throw new Error('That employee is no longer on the list.')
      return saved
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: employeeKey })
      const previous = queryClient.getQueryData<Employee[]>(employeeKey)
      queryClient.setQueryData<Employee[]>(employeeKey, (rows) =>
        (rows ?? []).map((employee) => (employee.id === input.id ? { ...employee, ...input.patch } : employee)),
      )
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(employeeKey, context.previous)
      toast.error(error instanceof Error ? error.message : 'Could not update the employee.')
    },
    onSuccess: (saved, _input, context) => {
      const before = context?.previous?.find((employee) => employee.id === saved.id)
      toast.success('Saved', {
        action: before
          ? {
              label: 'Undo',
              onClick: () => {
                db.updateEmployee(before.id, before)
                queryClient.setQueryData(employeeKey, context?.previous)
              },
            }
          : undefined,
      })
    },
  })
}

export function useRemoveEmployees() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await wait(220)
      return ids.map((id) => db.removeEmployee(id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: employeeKey })
      const previous = queryClient.getQueryData<Employee[]>(employeeKey)
      const idSet = new Set(ids)
      queryClient.setQueryData<Employee[]>(employeeKey, (rows) => (rows ?? []).filter((employee) => !idSet.has(employee.id)))
      return { previous }
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(employeeKey, context.previous)
      toast.error('Could not delete those employees.')
    },
    onSuccess: (removed, _ids, context) => {
      const label = removed.length === 1 ? `${removed[0]?.employee.name} deleted` : `${removed.length} employees deleted`
      toast.success(label, {
        action: {
          label: 'Undo',
          onClick: () => {
            removed.forEach((item) => db.restoreEmployee(item.employee, item.assignments))
            queryClient.setQueryData(employeeKey, context?.previous)
          },
        },
      })
    },
  })
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      await wait(480)
      const dashboard = await import('@/data/dashboard.json')
      return dashboard.default as import('@/types').DashboardSeed
    },
  })
}

export type { Store }
