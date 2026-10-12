import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import dashboardJson from '@/data/dashboard.json'
import { db, getSnapshot, subscribe } from '@/lib/db'
import type { Assignment, DashboardSeed, Employee, Project } from '@/types'

type DataValue = ReturnType<typeof getSnapshot> & {
  stats: DashboardSeed
  addEmployee: (input: Omit<Employee, 'id' | 'employeeCode'>) => Employee
  updateEmployee: (id: string, input: Omit<Employee, 'id' | 'employeeCode'>) => void
  deleteEmployee: (id: string) => void
  addProject: (input: Omit<Project, 'id' | 'progress'>) => Project
  updateProject: (id: string, input: Omit<Project, 'id' | 'progress'>) => void
  deleteProject: (id: string) => void
  addAssignment: (input: Omit<Assignment, 'id'>) => Assignment
  updateAssignment: (id: string, input: Omit<Assignment, 'id'>) => void
  deleteAssignment: (id: string) => void
  addDepartment: (label: string) => void
  addDesignation: (label: string) => void
  addAmenity: (label: string) => void
  setProjectFilter: (id: string) => void
  markNotificationsRead: () => void
}

const DataContext = createContext<DataValue | null>(null)
const seedStats = dashboardJson as DashboardSeed

export function DataProvider({ children }: { children: ReactNode }) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const value = useMemo<DataValue>(
    () => ({
      ...store,
      stats: seedStats,
      addEmployee: (input) => db.addEmployee(input),
      updateEmployee: (id, input) => {
        db.updateEmployee(id, input)
      },
      deleteEmployee: (id) => {
        db.removeEmployee(id)
      },
      addProject: (input) => db.addProject(input),
      updateProject: (id, input) => db.updateProject(id, input),
      deleteProject: (id) => db.deleteProject(id),
      addAssignment: (input) => db.addAssignment(input),
      updateAssignment: (id, input) => db.updateAssignment(id, input),
      deleteAssignment: (id) => db.deleteAssignment(id),
      addDepartment: (label) => db.addDepartment(label),
      addDesignation: (label) => db.addDesignation(label),
      addAmenity: (label) => db.addAmenity(label),
      setProjectFilter: (id) => db.setProjectFilter(id),
      markNotificationsRead: () => db.markNotificationsRead(),
    }),
    [store],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const value = useContext(DataContext)
  if (!value) throw new Error('useData must be used inside DataProvider')
  return value
}
