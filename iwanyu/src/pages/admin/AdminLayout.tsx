import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../providers/AuthProvider'
import { useEffect } from 'react'

export function AdminLayout() {
  const navigate = useNavigate()
  const { role } = useAuth()
  useEffect(() => {
    if (role && role !== 'admin') {
      navigate('/403', { replace: true })
    }
  }, [role, navigate])

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-8 w-8"/>
            <span className="font-semibold">Admin</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/admin" end className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Home</NavLink>
            <NavLink to="/admin/vendors" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Vendors</NavLink>
            <NavLink to="/admin/products" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Products</NavLink>
            <NavLink to="/admin/orders" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Orders</NavLink>
            <NavLink to="/admin/payouts" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Payouts</NavLink>
            <NavLink to="/admin/reports" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Reports</NavLink>
            <NavLink to="/admin/messages" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Messages</NavLink>
            <NavLink to="/admin/settings" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Settings</NavLink>
            <NavLink to="/admin/profile" className={({isActive}) => isActive ? 'text-neutral-900' : 'text-neutral-600'}>Profile</NavLink>
          </nav>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="text-sm">Sign out</button>
        </div>
      </header>
      <main className="bg-neutral-50">
        <div className="mx-auto max-w-7xl p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

