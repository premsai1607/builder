import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { ListSkeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'

const Login = lazy(() => import('@/pages/Login').then((module) => ({ default: module.Login })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard })))
const Employees = lazy(() => import('@/pages/Employees').then((module) => ({ default: module.Employees })))
const EmployeeForm = lazy(() => import('@/pages/EmployeeForm').then((module) => ({ default: module.EmployeeForm })))
const Projects = lazy(() => import('@/pages/Projects').then((module) => ({ default: module.Projects })))
const ProjectForm = lazy(() => import('@/pages/ProjectForm').then((module) => ({ default: module.ProjectForm })))
const AssignProject = lazy(() => import('@/pages/AssignProject').then((module) => ({ default: module.AssignProject })))
const DesignSystem = lazy(() => import('@/pages/DesignSystem').then((module) => ({ default: module.DesignSystem })))

function RequireAuth() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <AppShell />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: 'bg-foreground text-background border-0',
            actionButton: 'bg-primary text-primary-foreground',
          },
        }}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-8">
            <ListSkeleton />
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/design" element={<DesignSystem />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeForm />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectForm />} />
            <Route path="/assign" element={<AssignProject />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
