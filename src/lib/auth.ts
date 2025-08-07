// lib/auth.ts
import { supabase } from './supabase'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
  role: 'organizer' | 'traveler'
}

export interface SignInData {
  email: string
  password: string
}

export const authService = {
  async signUp({ email, password, fullName, phone, role }: SignUpData) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      // 2. Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          role,
          full_name: fullName,
          phone,
          onboarded: false,
        })
        .select()
        .single()

      if (profileError) throw profileError

      return { user: authData.user, profile: profileData }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

//   async resetPassword(email: string) {
//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(email, {
//         redirectTo: 'your-app://reset-password',
//       })

//       if (error) throw error
//     } catch (error) {
//       console.error('Reset password error:', error)
//       throw error
//     }
//   },

  async updateProfile(updates: {
    full_name?: string
    phone?: string
    onboarded?: boolean
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },
}