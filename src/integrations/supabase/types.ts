export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          budget_input_token_cost: number | null
          budget_max_24h: number | null
          budget_output_token_cost: number | null
          chat_using: string | null
          created_at: string | null
          dangerous_huggingface_api_key: string | null
          dangerous_openai_api_key: string | null
          dangerous_openrouter_api_key: string | null
          default_model: string | null
          default_temperature: number | null
          id: string
          max_output_tokens: number | null
          system_prompt: string | null
          updated_at: string | null
          use_keys_from: string | null
          utility_title_model: string | null
          utility_transcription_enabled: boolean | null
          utility_transcription_model: string | null
          utility_transcription_provider: string | null
        }
        Insert: {
          budget_input_token_cost?: number | null
          budget_max_24h?: number | null
          budget_output_token_cost?: number | null
          chat_using?: string | null
          created_at?: string | null
          dangerous_huggingface_api_key?: string | null
          dangerous_openai_api_key?: string | null
          dangerous_openrouter_api_key?: string | null
          default_model?: string | null
          default_temperature?: number | null
          id?: string
          max_output_tokens?: number | null
          system_prompt?: string | null
          updated_at?: string | null
          use_keys_from?: string | null
          utility_title_model?: string | null
          utility_transcription_enabled?: boolean | null
          utility_transcription_model?: string | null
          utility_transcription_provider?: string | null
        }
        Update: {
          budget_input_token_cost?: number | null
          budget_max_24h?: number | null
          budget_output_token_cost?: number | null
          chat_using?: string | null
          created_at?: string | null
          dangerous_huggingface_api_key?: string | null
          dangerous_openai_api_key?: string | null
          dangerous_openrouter_api_key?: string | null
          default_model?: string | null
          default_temperature?: number | null
          id?: string
          max_output_tokens?: number | null
          system_prompt?: string | null
          updated_at?: string | null
          use_keys_from?: string | null
          utility_title_model?: string | null
          utility_transcription_enabled?: boolean | null
          utility_transcription_model?: string | null
          utility_transcription_provider?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          column_index: number | null
          content: string | null
          created_at: string | null
          external_id: string | null
          id: string
          input_audio_token_price: number | null
          input_audio_tokens: number | null
          input_cached_audio_token_price: number | null
          input_cached_audio_tokens: number | null
          input_cached_image_token_price: number | null
          input_cached_image_tokens: number | null
          input_cached_token_price: number | null
          input_cached_tokens: number | null
          input_image_token_price: number | null
          input_image_tokens: number | null
          input_token_price: number | null
          input_tokens: number | null
          model: string | null
          other_cost: number | null
          output_audio_token_price: number | null
          output_audio_tokens: number | null
          output_image_token_price: number | null
          output_image_tokens: number | null
          output_reasoning_token_price: number | null
          output_reasoning_tokens: number | null
          output_token_price: number | null
          output_tokens: number | null
          provider: string | null
          raw_output: Json | null
          role: string
          thread_id: string | null
          tool_call: Json | null
          updated_at: string | null
        }
        Insert: {
          column_index?: number | null
          content?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          input_audio_token_price?: number | null
          input_audio_tokens?: number | null
          input_cached_audio_token_price?: number | null
          input_cached_audio_tokens?: number | null
          input_cached_image_token_price?: number | null
          input_cached_image_tokens?: number | null
          input_cached_token_price?: number | null
          input_cached_tokens?: number | null
          input_image_token_price?: number | null
          input_image_tokens?: number | null
          input_token_price?: number | null
          input_tokens?: number | null
          model?: string | null
          other_cost?: number | null
          output_audio_token_price?: number | null
          output_audio_tokens?: number | null
          output_image_token_price?: number | null
          output_image_tokens?: number | null
          output_reasoning_token_price?: number | null
          output_reasoning_tokens?: number | null
          output_token_price?: number | null
          output_tokens?: number | null
          provider?: string | null
          raw_output?: Json | null
          role: string
          thread_id?: string | null
          tool_call?: Json | null
          updated_at?: string | null
        }
        Update: {
          column_index?: number | null
          content?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          input_audio_token_price?: number | null
          input_audio_tokens?: number | null
          input_cached_audio_token_price?: number | null
          input_cached_audio_tokens?: number | null
          input_cached_image_token_price?: number | null
          input_cached_image_tokens?: number | null
          input_cached_token_price?: number | null
          input_cached_tokens?: number | null
          input_image_token_price?: number | null
          input_image_tokens?: number | null
          input_token_price?: number | null
          input_tokens?: number | null
          model?: string | null
          other_cost?: number | null
          output_audio_token_price?: number | null
          output_audio_tokens?: number | null
          output_image_token_price?: number | null
          output_image_tokens?: number | null
          output_reasoning_token_price?: number | null
          output_reasoning_tokens?: number | null
          output_token_price?: number | null
          output_tokens?: number | null
          provider?: string | null
          raw_output?: Json | null
          role?: string
          thread_id?: string | null
          tool_call?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      microtasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          input_audio_token_price: number | null
          input_audio_tokens: number | null
          input_cached_audio_token_price: number | null
          input_cached_audio_tokens: number | null
          input_cached_image_token_price: number | null
          input_cached_image_tokens: number | null
          input_cached_token_price: number | null
          input_cached_tokens: number | null
          input_data: Json | null
          input_image_token_price: number | null
          input_image_tokens: number | null
          input_token_price: number | null
          input_tokens: number | null
          model: string | null
          output_audio_token_price: number | null
          output_audio_tokens: number | null
          output_data: Json | null
          output_image_token_price: number | null
          output_image_tokens: number | null
          output_reasoning_token_price: number | null
          output_reasoning_tokens: number | null
          output_token_price: number | null
          output_tokens: number | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          task_type: string
          temperature: number | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_audio_token_price?: number | null
          input_audio_tokens?: number | null
          input_cached_audio_token_price?: number | null
          input_cached_audio_tokens?: number | null
          input_cached_image_token_price?: number | null
          input_cached_image_tokens?: number | null
          input_cached_token_price?: number | null
          input_cached_tokens?: number | null
          input_data?: Json | null
          input_image_token_price?: number | null
          input_image_tokens?: number | null
          input_token_price?: number | null
          input_tokens?: number | null
          model?: string | null
          output_audio_token_price?: number | null
          output_audio_tokens?: number | null
          output_data?: Json | null
          output_image_token_price?: number | null
          output_image_tokens?: number | null
          output_reasoning_token_price?: number | null
          output_reasoning_tokens?: number | null
          output_token_price?: number | null
          output_tokens?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          task_type: string
          temperature?: number | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_audio_token_price?: number | null
          input_audio_tokens?: number | null
          input_cached_audio_token_price?: number | null
          input_cached_audio_tokens?: number | null
          input_cached_image_token_price?: number | null
          input_cached_image_tokens?: number | null
          input_cached_token_price?: number | null
          input_cached_tokens?: number | null
          input_data?: Json | null
          input_image_token_price?: number | null
          input_image_tokens?: number | null
          input_token_price?: number | null
          input_tokens?: number | null
          model?: string | null
          output_audio_token_price?: number | null
          output_audio_tokens?: number | null
          output_data?: Json | null
          output_image_token_price?: number | null
          output_image_tokens?: number | null
          output_reasoning_token_price?: number | null
          output_reasoning_tokens?: number | null
          output_token_price?: number | null
          output_tokens?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          task_type?: string
          temperature?: number | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "microtasks_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_errors: {
        Row: {
          created_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          raised_by: string | null
          thread_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          raised_by?: string | null
          thread_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          raised_by?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thread_errors_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
