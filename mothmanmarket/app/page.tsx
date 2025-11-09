"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser } from '@/utils/context/UserContext'

export default function Home() {
  const router = useRouter()
  const { userId, initialized } = useUser()

  // wait for the UserProvider to initialize (reads localStorage) before redirecting
  useEffect(() => {
    if (!initialized) return;
    console.log('User ID from context:', userId)
    if (!userId) {
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  }, [initialized, userId, router])

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-zinc-500">Initializing...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to the Mothman Market
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            You’ve been chosen to witness the Prophecies. 🦋  
            Redirecting you to the dashboard...
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button
            onClick={() => {
              localStorage.removeItem('user_id')
              router.push('/login')
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-red-700 text-white px-5 hover:bg-red-600 transition md:w-[158px]"
          >
            Logout
          </button>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-red-800 px-5 transition-colors hover:bg-red-900/20 md:w-[158px]"
            href="/market"
          >
            Enter Market
          </a>
          <button
            onClick={() => {
              router.push('/wallet')
            }}
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-red-800 px-5 transition-colors hover:bg-red-900/20 md:w-[158px]"
          >
            Wallet
          </button>
        </div>
      </main>

    </div>
  )
}

