export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          idea: string
          status: 'pending' | 'generating' | 'rendering' | 'completed' | 'failed'
          progress: number
          video_url: string | null
          error_log: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea: string
          status?: 'pending' | 'generating' | 'rendering' | 'completed' | 'failed'
          progress?: number
          video_url?: string | null
          error_log?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea?: string
          status?: 'pending' | 'generating' | 'rendering' | 'completed' | 'failed'
          progress?: number
          video_url?: string | null
          error_log?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
