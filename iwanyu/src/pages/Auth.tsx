import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../providers/AuthProvider'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  mode: z.enum(['login', 'register'])
})

type FormValues = z.infer<typeof schema>

export function AuthPage() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'login' as const }
  })

  useEffect(() => {
    if (user && role) {
      navigate(role === 'admin' ? '/admin' : '/vendor', { replace: true })
    }
  }, [user, role, navigate])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    if (values.mode === 'login') {
      await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
    } else {
      const { data, error } = await supabase.auth.signUp({ email: values.email, password: values.password })
      if (!error && data.user) {
        // default to vendor role until approved by admin later
        await supabase.from('profiles').insert({ id: data.user.id, role: 'vendor' })
      }
    }
    setLoading(false)
  }

  const mode = watch('mode')

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-white">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo.png" alt="Iwanyu" className="h-8 w-8" />
          <h1 className="text-xl font-semibold">Iwanyu</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" {...register('password')} className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="login" {...register('mode')} /> Login
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="register" {...register('mode')} /> Register
            </label>
          </div>
          <button disabled={loading} className="w-full rounded-md bg-brand px-4 py-2 font-medium text-neutral-900 disabled:opacity-70">
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </button>
          <button type="button" onClick={() => supabase.auth.resetPasswordForEmail((document.querySelector('input[type=email]') as HTMLInputElement)?.value ?? '')} className="w-full text-sm text-neutral-600 hover:text-neutral-900">
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  )
}

