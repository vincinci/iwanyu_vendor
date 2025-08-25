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
    try {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (adminError || !adminUser) {
        return null
      }

      return adminUser
    } catch (dbError) {
      console.log('Admin table access failed:', dbError)
      return null
    }
  } catch (error) {
    console.error('Admin verification error:', error)
    return null
  }
}

export async function getAdminPermissions(userId: string): Promise<string[]> {
  try {
    const supabase = createClient()
    
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('permissions')
        .eq('user_id', userId)
        .single()

      if (error || !adminUser) {
        return []
      }

      return Array.isArray(adminUser.permissions) ? adminUser.permissions : []
    } catch (dbError) {
      console.log('Admin permissions check failed:', dbError)
      return []
    }
  } catch (error) {
    console.error('Error getting admin permissions:', error)
    return []
  }
}
