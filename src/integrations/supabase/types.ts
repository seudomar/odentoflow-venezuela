export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appt_date: string
          appt_time: string
          clinic_id: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string
          payment_account_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          treatment: string
          updated_at: string
        }
        Insert: {
          appt_date: string
          appt_time: string
          clinic_id: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone: string
          payment_account_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          treatment: string
          updated_at?: string
        }
        Update: {
          appt_date?: string
          appt_time?: string
          clinic_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string
          payment_account_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          treatment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_members: {
        Row: {
          clinic_id: string
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["clinic_role"]
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["clinic_role"]
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["clinic_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          rif: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          rif?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          rif?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          cedula: string | null
          clinic_id: string
          created_at: string
          email: string | null
          files: Json
          gender: string | null
          history: string | null
          id: string
          last_visit: string | null
          name: string
          phone: string | null
          teeth: Json
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cedula?: string | null
          clinic_id: string
          created_at?: string
          email?: string | null
          files?: Json
          gender?: string | null
          history?: string | null
          id?: string
          last_visit?: string | null
          name: string
          phone?: string | null
          teeth?: Json
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cedula?: string | null
          clinic_id?: string
          created_at?: string
          email?: string | null
          files?: Json
          gender?: string | null
          history?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          phone?: string | null
          teeth?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          amount_usd: number
          clinic_id: string
          created_at: string
          currency: Database["public"]["Enums"]["payment_currency"]
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          patient_id: string | null
          patient_name: string
          payment_date: string
          rate: number
        }
        Insert: {
          amount: number
          amount_usd: number
          clinic_id: string
          created_at?: string
          currency: Database["public"]["Enums"]["payment_currency"]
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          patient_id?: string | null
          patient_name: string
          payment_date?: string
          rate: number
        }
        Update: {
          amount?: number
          amount_usd?: number
          clinic_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["payment_currency"]
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          patient_id?: string | null
          patient_name?: string
          payment_date?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_clinic_member: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "pendiente"
        | "confirmado"
        | "completado"
        | "cancelado"
      clinic_role: "owner" | "doctor" | "assistant"
      payment_currency: "USD" | "VEF"
      payment_method:
        | "Zelle"
        | "Efectivo"
        | "Pago Móvil"
        | "Transferencia"
        | "Binance"
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
    Enums: {
      appointment_status: [
        "pendiente",
        "confirmado",
        "completado",
        "cancelado",
      ],
      clinic_role: ["owner", "doctor", "assistant"],
      payment_currency: ["USD", "VEF"],
      payment_method: [
        "Zelle",
        "Efectivo",
        "Pago Móvil",
        "Transferencia",
        "Binance",
      ],
    },
  },
} as const
