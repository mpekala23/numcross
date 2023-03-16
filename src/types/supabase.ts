export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attempts: {
        Row: {
          has_cheated: boolean | null
          id: number
          jsonb: Json
          pid: number
          start_time: string
          uid: string
        }
        Insert: {
          has_cheated?: boolean | null
          id?: number
          jsonb: Json
          pid: number
          start_time: string
          uid: string
        }
        Update: {
          has_cheated?: boolean | null
          id?: number
          jsonb?: Json
          pid?: number
          start_time?: string
          uid?: string
        }
      }
      profiles: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
      }
      puzzles: {
        Row: {
          created_at: string | null
          difficulty: string
          id: number
          live_date: string
          puzzle: Json
          solution: Json
          theme: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string
          id?: number
          live_date: string
          puzzle: Json
          solution: Json
          theme?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          id?: number
          live_date?: string
          puzzle?: Json
          solution?: Json
          theme?: string | null
        }
      }
      solves: {
        Row: {
          bid: number
          did_cheat: boolean
          end_time: string
          id: number
          start_time: string
          uid: string
        }
        Insert: {
          bid: number
          did_cheat: boolean
          end_time: string
          id?: number
          start_time: string
          uid: string
        }
        Update: {
          bid?: number
          did_cheat?: boolean
          end_time?: string
          id?: number
          start_time?: string
          uid?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

