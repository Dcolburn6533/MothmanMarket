'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    if (!trimmedUsername || !trimmedPassword) {
      return setError('Username and password are required.')
    }

    if (mode === 'signup') {
      const { error } = await supabase
        .from('profiles')
        .insert([{ username: trimmedUsername, password: trimmedPassword }])

      if (error) return setError(error.message)
      router.push('/login')
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, password')
        .eq('username', trimmedUsername)
        .single()

    console.log('Login data:', data, 'Error:', error)
      if (error || !data || data.password !== trimmedPassword) {
        return setError('Invalid username or password')
      }

      localStorage.setItem('user_id', data.id)
      router.push('/')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-sm mx-auto mt-24 bg-black/50 p-6 rounded-2xl border border-red-900 text-white"
    >
      <h1 className="text-2xl font-bold text-center text-red-500 mb-2">
        {mode === 'login' ? 'Speak with the Mothman' : 'Join the Cult of Mothman'}
      </h1>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="p-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-red-500"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Secret phrase"
        className="p-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-red-500"
      />

      {error && <p className="text-red-400 text-center text-sm">{error}</p>}

      <button
        type="submit"
        className="bg-red-700 hover:bg-red-600 py-2 rounded font-semibold transition"
      >
        {mode === 'login' ? 'Sign In' : 'Sign Up'}
      </button>

      <p className="text-center text-sm text-gray-400">
        {mode === 'login' ? (
          <>
            Don’t have an account?{' '}
            <a href="/signup" className="text-red-400 hover:underline">Join here</a>.
          </>
        ) : (
          <>
            Already a believer?{' '}
            <a href="/login" className="text-red-400 hover:underline">Sign in</a>.
          </>
        )}
      </p>
    </form>
  )
}
