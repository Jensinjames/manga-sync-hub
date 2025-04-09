export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      annotations: {
        Row: {
          bbox: number[] | null
          confidence: number | null
          created_at: string
          id: string
          label: string
          prediction_id: string
        }
        Insert: {
          bbox?: number[] | null
          confidence?: number | null
          created_at?: string
          id?: string
          label: string
          prediction_id: string
        }
        Update: {
          bbox?: number[] | null
          confidence?: number | null
          created_at?: string
          id?: string
          label?: string
          prediction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          changed_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string | null
          table_name: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string | null
          table_name?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      panel_jobs: {
        Row: {
          attempt_count: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          job_type: string
          metadata: Json | null
          panel_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          attempt_count?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          metadata?: Json | null
          panel_id: string
          started_at?: string | null
          status: string
        }
        Update: {
          attempt_count?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          metadata?: Json | null
          panel_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_jobs_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panel_metadata"
            referencedColumns: ["panel_id"]
          },
        ]
      }
      panel_metadata: {
        Row: {
          action_level: string | null
          character_count: number | null
          content: string | null
          created_at: string | null
          id: string
          metadata: Json
          mood: string | null
          panel_id: string
          scene_type: string | null
          updated_at: string | null
        }
        Insert: {
          action_level?: string | null
          character_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json
          mood?: string | null
          panel_id: string
          scene_type?: string | null
          updated_at?: string | null
        }
        Update: {
          action_level?: string | null
          character_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json
          mood?: string | null
          panel_id?: string
          scene_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          allow_dynamic: boolean
          created_at: string
          id: string
          image_url: string
          iou_threshold: number
          model_name: string
          score_threshold: number
        }
        Insert: {
          allow_dynamic?: boolean
          created_at?: string
          id?: string
          image_url: string
          iou_threshold?: number
          model_name: string
          score_threshold?: number
        }
        Update: {
          allow_dynamic?: boolean
          created_at?: string
          id?: string
          image_url?: string
          iou_threshold?: number
          model_name?: string
          score_threshold?: number
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
