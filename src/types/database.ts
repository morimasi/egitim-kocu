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
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'coach' | 'student'
          avatar_url: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'coach' | 'student'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      students: {
        Row: {
          id: string
          profile_id: string | null
          coach_id: string | null
          grade_level: string | null
          school_name: string | null
          subjects: string[] | null
          goals: string | null
          parent_email: string | null
          parent_phone: string | null
          enrollment_date: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['students']['Row']>
        Update: Partial<Database['public']['Tables']['students']['Row']>
      }
      assignments: {
        Row: {
          id: string
          title: string
          description: string | null
          subject: string | null
          coach_id: string | null
          student_id: string | null
          due_date: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'submitted' | 'reviewed' | 'completed'
          estimated_duration: number | null
          attachment_urls: string[] | null
          instructions: string | null
          max_score: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['assignments']['Row']>
        Update: Partial<Database['public']['Tables']['assignments']['Row']>
      }
      assignment_submissions: {
        Row: {
          id: string
          assignment_id: string | null
          student_id: string | null
          content: string | null
          attachment_urls: string[] | null
          submitted_at: string | null
          is_final: boolean | null
          notes: string | null
        }
        Insert: Partial<Database['public']['Tables']['assignment_submissions']['Row']>
        Update: Partial<Database['public']['Tables']['assignment_submissions']['Row']>
      }
      assignment_reviews: {
        Row: {
          id: string
          assignment_id: string | null
          submission_id: string | null
          coach_id: string | null
          score: number | null
          feedback: string | null
          suggestions: string | null
          reviewed_at: string | null
          is_final_review: boolean | null
        }
        Insert: Partial<Database['public']['Tables']['assignment_reviews']['Row']>
        Update: Partial<Database['public']['Tables']['assignment_reviews']['Row']>
      }
      messages: {
        Row: {
          id: string
          sender_id: string | null
          receiver_id: string | null
          content: string
          attachment_urls: string[] | null
          is_read: boolean | null
          parent_message_id: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['messages']['Row']>
        Update: Partial<Database['public']['Tables']['messages']['Row']>
      }
      reminders: {
        Row: {
          id: string
          user_id: string | null
          assignment_id: string | null
          title: string
          message: string | null
          remind_at: string
          is_sent: boolean | null
          reminder_type: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['reminders']['Row']>
        Update: Partial<Database['public']['Tables']['reminders']['Row']>
      }
      student_progress: {
        Row: {
          id: string
          student_id: string | null
          subject: string | null
          week_start: string
          assignments_completed: number | null
          assignments_total: number | null
          average_score: number | null
          study_hours: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['student_progress']['Row']>
        Update: Partial<Database['public']['Tables']['student_progress']['Row']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_role: 'coach' | 'student'
      assignment_status: 'pending' | 'submitted' | 'reviewed' | 'completed'
      priority_level: 'low' | 'medium' | 'high' | 'urgent'
    }
  }
}

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
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'coach' | 'student'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'coach' | 'student'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'coach' | 'student'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string
          coach_id: string | null
          grade_level: string | null
          school_name: string | null
          subjects: string[] | null
          goals: string | null
          parent_email: string | null
          parent_phone: string | null
          enrollment_date: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          coach_id?: string | null
          grade_level?: string | null
          school_name?: string | null
          subjects?: string[] | null
          goals?: string | null
          parent_email?: string | null
          parent_phone?: string | null
          enrollment_date?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          coach_id?: string | null
          grade_level?: string | null
          school_name?: string | null
          subjects?: string[] | null
          goals?: string | null
          parent_email?: string | null
          parent_phone?: string | null
          enrollment_date?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          title: string
          description: string | null
          subject: string | null
          coach_id: string
          student_id: string
          due_date: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'submitted' | 'reviewed' | 'completed'
          estimated_duration: number | null
          attachment_urls: string[] | null
          instructions: string | null
          max_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          subject?: string | null
          coach_id: string
          student_id: string
          due_date: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'submitted' | 'reviewed' | 'completed'
          estimated_duration?: number | null
          attachment_urls?: string[] | null
          instructions?: string | null
          max_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          subject?: string | null
          coach_id?: string
          student_id?: string
          due_date?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'submitted' | 'reviewed' | 'completed'
          estimated_duration?: number | null
          attachment_urls?: string[] | null
          instructions?: string | null
          max_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      assignment_submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          content: string | null
          attachment_urls: string[] | null
          submitted_at: string
          is_final: boolean | null
          notes: string | null
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          content?: string | null
          attachment_urls?: string[] | null
          submitted_at?: string
          is_final?: boolean | null
          notes?: string | null
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          content?: string | null
          attachment_urls?: string[] | null
          submitted_at?: string
          is_final?: boolean | null
          notes?: string | null
        }
      }
      assignment_reviews: {
        Row: {
          id: string
          assignment_id: string
          submission_id: string
          coach_id: string
          score: number | null
          feedback: string | null
          suggestions: string | null
          reviewed_at: string
          is_final_review: boolean | null
        }
        Insert: {
          id?: string
          assignment_id: string
          submission_id: string
          coach_id: string
          score?: number | null
          feedback?: string | null
          suggestions?: string | null
          reviewed_at?: string
          is_final_review?: boolean | null
        }
        Update: {
          id?: string
          assignment_id?: string
          submission_id?: string
          coach_id?: string
          score?: number | null
          feedback?: string | null
          suggestions?: string | null
          reviewed_at?: string
          is_final_review?: boolean | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          attachment_urls: string[] | null
          is_read: boolean | null
          parent_message_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          attachment_urls?: string[] | null
          is_read?: boolean | null
          parent_message_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          attachment_urls?: string[] | null
          is_read?: boolean | null
          parent_message_id?: string | null
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          assignment_id: string
          title: string
          message: string | null
          remind_at: string
          is_sent: boolean | null
          reminder_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assignment_id: string
          title: string
          message?: string | null
          remind_at: string
          is_sent?: boolean | null
          reminder_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assignment_id?: string
          title?: string
          message?: string | null
          remind_at?: string
          is_sent?: boolean | null
          reminder_type?: string | null
          created_at?: string
        }
      }
      student_progress: {
        Row: {
          id: string
          student_id: string
          subject: string | null
          week_start: string
          assignments_completed: number | null
          assignments_total: number | null
          average_score: number | null
          study_hours: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject?: string | null
          week_start: string
          assignments_completed?: number | null
          assignments_total?: number | null
          average_score?: number | null
          study_hours?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject?: string | null
          week_start?: string
          assignments_completed?: number | null
          assignments_total?: number | null
          average_score?: number | null
          study_hours?: number | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Assignment = Database['public']['Tables']['assignments']['Row']
export type AssignmentSubmission = Database['public']['Tables']['assignment_submissions']['Row']
export type AssignmentReview = Database['public']['Tables']['assignment_reviews']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Reminder = Database['public']['Tables']['reminders']['Row']
export type StudentProgress = Database['public']['Tables']['student_progress']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type StudentInsert = Database['public']['Tables']['students']['Insert']
export type AssignmentInsert = Database['public']['Tables']['assignments']['Insert']
export type AssignmentSubmissionInsert = Database['public']['Tables']['assignment_submissions']['Insert']
export type AssignmentReviewInsert = Database['public']['Tables']['assignment_reviews']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type ReminderInsert = Database['public']['Tables']['reminders']['Insert']
export type StudentProgressInsert = Database['public']['Tables']['student_progress']['Insert']