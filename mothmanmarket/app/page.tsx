'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      router.push('/login')
    }
  }, [router])

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
            If you can see this, you’re logged in.
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
        </div>
      </main>
    </div>
  )
}
