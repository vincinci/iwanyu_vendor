import { createClient } from '@/lib/supabase-client'

export interface AdminUser {
  id: string
  user_id: string
  role: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export async function verifyAdminSession(): Promise<AdminUser | null> {
  try {
    const supabase = createClient()
    
    // Get current user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser) {
      return null
    }

    return adminUser
  } catch (error) {
    console.error('Admin verification error:', error)
    return null
  }
}

export async function getAdminPermissions(userId: string): Promise<string[]> {
  try {
    const supabase = createClient()
    
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('permissions')
      .eq('user_id', userId)
      .single()

    if (error || !adminUser) {
      return []
    }

    return adminUser.permissions || []
  } catch (error) {
    console.error('Error fetching admin permissions:', error)
    return []
  }
}

export function hasPermission(permissions: string[], requiredPermission: string): boolean {
  return permissions.includes('all') || permissions.includes(requiredPermission)
}
