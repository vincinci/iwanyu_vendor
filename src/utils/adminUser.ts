// Quick script to check if admin user exists and create one if needed
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function ensureAdminUser() {
  const supabase = createClientComponentClient()
  
  // Check if admin user exists
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .maybeSingle()
  
  if (adminProfile) {
    return adminProfile.id
  }
  
  // Create system admin user if none exists
  const { data: newAdmin, error } = await supabase
    .from('profiles')
    .insert({
      id: 'system-admin-uuid', // Use a fixed UUID for system admin
      role: 'admin',
      email: 'admin@iwanyu.rw'
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error creating admin user:', error)
    return 'system-admin-uuid' // fallback
  }
  
  return newAdmin.id
}
