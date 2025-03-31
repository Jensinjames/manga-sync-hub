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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
