import { useForm } from 'react-hook-form'

export function AdminProfile() {
  const { register } = useForm()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div>
          <label className="block text-sm mb-1">Display name</label>
          <input className="w-full rounded-md border px-3 py-2" {...register('name')} />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full rounded-md border px-3 py-2" {...register('password')} />
        </div>
        <button className="rounded-md bg-brand px-3 py-2 text-sm">Save</button>
      </div>
    </div>
  )
}

