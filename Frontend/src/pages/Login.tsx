import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { wait } from '@/lib/delay'
import { isEmailValid } from '@/lib/validation'

export function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const ready = useQuery({
    queryKey: ['login-shell'],
    queryFn: async () => {
      await wait(320)
      return true
    },
    staleTime: Infinity,
  })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    await wait(280)
    const match = login(email, password)
    setPending(false)
    if (!match) {
      setError('That email or password does not match.')
      return
    }
    navigate('/dashboard')
  }

  if (ready.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-8 shadow-card" aria-hidden>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-muted p-12 lg:flex">
        <p className="text-sm font-semibold tracking-wide">BuildPro</p>
        <div>
          <h1 className="max-w-sm text-4xl leading-tight font-semibold tracking-tight">A quieter way to run the site.</h1>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">Projects, people, and payments in one place. Built for the people who are actually on the job.</p>
        </div>
        <p className="text-xs text-muted-foreground">Construction operations</p>
      </section>
      <section className="flex items-center justify-center bg-background px-4 py-10">
        <form onSubmit={submit} className="w-full max-w-md" noValidate>
          <p className="text-sm font-semibold lg:hidden">BuildPro</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Use the work email your admin set up.</p>
          <div className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={error}
              valid={isEmailValid(email)}
            />
            <Input
              label="Password"
              name="password"
              secret
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              valid={password.length >= 8}
            />
          </div>
          <Button className="mt-6 w-full" type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </section>
    </main>
  )
}
