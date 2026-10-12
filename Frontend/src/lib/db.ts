import assignmentsJson from '@/data/assignments.json'
import dashboardJson from '@/data/dashboard.json'
import employeesJson from '@/data/employees.json'
import lookupsJson from '@/data/lookups.json'
import projectsJson from '@/data/projects.json'
import type { AppNotification, Assignment, Employee, Project } from '@/types'

const STORAGE_KEY = 'buildpro.data.v1'

export type Store = {
  employees: Employee[]
  projects: Project[]
  assignments: Assignment[]
  departments: string[]
  designations: string[]
  amenities: string[]
  notifications: AppNotification[]
  projectFilter: string
}

type RemovedEmployee = {
  employee: Employee
  assignments: Assignment[]
}

function seedStore(): Store {
  return {
    employees: employeesJson as Employee[],
    projects: projectsJson as Project[],
    assignments: assignmentsJson as Assignment[],
    departments: [...lookupsJson.departments],
    designations: [...lookupsJson.designations],
    amenities: [...lookupsJson.amenities],
    notifications: (dashboardJson.notifications as AppNotification[]).map((item) => ({ ...item, read: false })),
    projectFilter: 'all',
  }
}

function readStore(): Store {
  const seed = seedStore()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw) as Partial<Store>
    return {
      employees: parsed.employees?.length ? parsed.employees : seed.employees,
      projects: parsed.projects?.length ? parsed.projects : seed.projects,
      assignments: parsed.assignments ?? seed.assignments,
      departments: parsed.departments?.length ? parsed.departments : seed.departments,
      designations: parsed.designations?.length ? parsed.designations : seed.designations,
      amenities: parsed.amenities?.length ? parsed.amenities : seed.amenities,
      notifications: parsed.notifications ?? seed.notifications,
      projectFilter: parsed.projectFilter || 'all',
    }
  } catch {
    return seed
  }
}

function nextEmployeeCode(employees: Employee[]) {
  const numbers = employees.map((employee) => Number(employee.employeeCode.replace(/\D/g, '')) || 0)
  return `EMP-${Math.max(2400, ...numbers) + 1}`
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

let state: Store = readStore()
const listeners = new Set<() => void>()

function emit() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach((listener) => listener())
}

function addLabel(key: 'departments' | 'designations' | 'amenities', label: string) {
  const clean = label.trim()
  if (!clean) return
  if (state[key].some((item) => item.toLowerCase() === clean.toLowerCase())) return
  state = { ...state, [key]: [...state[key], clean] }
  emit()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return state
}

export function peekEmployeeCode() {
  return nextEmployeeCode(state.employees)
}

export const db = {
  listEmployees: () => [...state.employees],
  addEmployee(input: Omit<Employee, 'id' | 'employeeCode'>) {
    const employee: Employee = {
      ...input,
      id: uid('emp'),
      employeeCode: nextEmployeeCode(state.employees),
    }
    state = { ...state, employees: [employee, ...state.employees] }
    emit()
    return employee
  },
  updateEmployee(id: string, patch: Partial<Omit<Employee, 'id' | 'employeeCode'>>) {
    const current = state.employees.find((employee) => employee.id === id)
    if (!current) return null
    const next: Employee = { ...current, ...patch, id, employeeCode: current.employeeCode }
    state = {
      ...state,
      employees: state.employees.map((employee) => (employee.id === id ? next : employee)),
    }
    emit()
    return next
  },
  removeEmployee(id: string): RemovedEmployee | null {
    const employee = state.employees.find((item) => item.id === id)
    if (!employee) return null
    const assignments = state.assignments.filter((item) => item.employeeId === id)
    state = {
      ...state,
      employees: state.employees.filter((item) => item.id !== id),
      assignments: state.assignments.filter((item) => item.employeeId !== id),
    }
    emit()
    return { employee, assignments }
  },
  restoreEmployee(employee: Employee, assignments: Assignment[]) {
    state = {
      ...state,
      employees: [employee, ...state.employees.filter((item) => item.id !== employee.id)],
      assignments: [...assignments, ...state.assignments.filter((item) => item.employeeId !== employee.id)],
    }
    emit()
  },
  addProject(input: Omit<Project, 'id' | 'progress'>) {
    const project: Project = { ...input, id: uid('prj'), progress: 0 }
    state = { ...state, projects: [project, ...state.projects] }
    emit()
    return project
  },
  updateProject(id: string, input: Omit<Project, 'id' | 'progress'>) {
    state = {
      ...state,
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...input, id, progress: project.progress } : project,
      ),
    }
    emit()
  },
  deleteProject(id: string) {
    state = {
      ...state,
      projects: state.projects.filter((project) => project.id !== id),
      assignments: state.assignments.filter((assignment) => assignment.projectId !== id),
      projectFilter: state.projectFilter === id ? 'all' : state.projectFilter,
    }
    emit()
  },
  addAssignment(input: Omit<Assignment, 'id'>) {
    const assignment: Assignment = { ...input, id: uid('asg') }
    state = { ...state, assignments: [assignment, ...state.assignments] }
    emit()
    return assignment
  },
  updateAssignment(id: string, input: Omit<Assignment, 'id'>) {
    state = {
      ...state,
      assignments: state.assignments.map((assignment) =>
        assignment.id === id ? { ...assignment, ...input, id } : assignment,
      ),
    }
    emit()
  },
  deleteAssignment(id: string) {
    state = {
      ...state,
      assignments: state.assignments.filter((assignment) => assignment.id !== id),
    }
    emit()
  },
  addDepartment: (label: string) => addLabel('departments', label),
  addDesignation: (label: string) => addLabel('designations', label),
  addAmenity: (label: string) => addLabel('amenities', label),
  setProjectFilter(id: string) {
    state = { ...state, projectFilter: id }
    emit()
  },
  markNotificationsRead() {
    state = {
      ...state,
      notifications: state.notifications.map((item) => ({ ...item, read: true })),
    }
    emit()
  },
}
