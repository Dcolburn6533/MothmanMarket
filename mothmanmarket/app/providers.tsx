'use client'

import type { ReactNode } from 'react'
import { UserProvider } from '@/utils/context/UserContext'

export function Providers({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>
}
