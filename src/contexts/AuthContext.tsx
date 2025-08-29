'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Session } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type AuthContextType = {
  user: User | null
  session: Session | null
  userProfile: any | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClientComponentClient<Database>()

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use Promise.all to fetch vendor and profile data in parallel
      const [vendorResult, profileResult] = await Promise.all([
        supabase
          .from('vendors')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
      ])

      const { data: vendor, error: vendorError } = vendorResult
      const { data: profile, error: profileError } = profileResult

      if (!vendorError && vendor) {
        setUserProfile({ ...vendor, role: 'vendor' })
        return
      }

      if (!profileError && profile) {
        setUserProfile({ ...profile, role: profile.role || 'user' })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      
      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
  }

  const value = {
    user,
    session,
    userProfile,
    isLoading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
