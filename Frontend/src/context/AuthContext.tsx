import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import usersJson from '@/data/users.json'
import type { UserAccount } from '@/types'

const users = usersJson as UserAccount[]
const SESSION_KEY = 'buildpro.session'

type AuthValue = {
  user: UserAccount | null
  ready: boolean
  login: (email: string, password: string) => UserAccount | null
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function readSession() {
  const id = sessionStorage.getItem(SESSION_KEY)
  return users.find((account) => account.id === id) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(() => readSession())

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready: true,
      login: (email, password) => {
        const match = users.find(
          (account) =>
            account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password,
        )
        if (!match) return null
        sessionStorage.setItem(SESSION_KEY, match.id)
        setUser(match)
        return match
      },
      logout: () => {
        sessionStorage.removeItem(SESSION_KEY)
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
