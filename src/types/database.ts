/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'accounts';

/**
 * Room status types
 */
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

/**
 * Reservation status types
 */
export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

/**
 * Invoice status types
 */
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partially_paid' | 'overdue';

/**
 * Payment method types
 */
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Permission action types
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute';

/**
 * Permission interface for RBAC
 */
export interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: PermissionAction;
  created_at: string;
}

/**
 * Role-Permission junction table interface
 */
export interface RolePermission {
  id: string;
  role: UserRole;
  permission_id: string;
  permission?: Permission;
  created_at: string;
}

/**
 * Permission constants for RBAC
 */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_VIEW_ALL: 'dashboard.view_all',
  
  // Rooms
  ROOMS_VIEW: 'rooms.view',
  ROOMS_CREATE: 'rooms.create',
  ROOMS_UPDATE: 'rooms.update',
  ROOMS_DELETE: 'rooms.delete',
  ROOMS_UPDATE_STATUS: 'rooms.update_status',
  
  // Guests
  GUESTS_VIEW: 'guests.view',
  GUESTS_CREATE: 'guests.create',
  GUESTS_UPDATE: 'guests.update',
  GUESTS_DELETE: 'guests.delete',
  
  // Reservations
  RESERVATIONS_VIEW: 'reservations.view',
  RESERVATIONS_CREATE: 'reservations.create',
  RESERVATIONS_UPDATE: 'reservations.update',
  RESERVATIONS_DELETE: 'reservations.delete',
  RESERVATIONS_CANCEL: 'reservations.cancel',
  
  // Front Desk
  FRONTDESK_ACCESS: 'frontdesk.access',
  FRONTDESK_CHECKIN: 'frontdesk.checkin',
  FRONTDESK_CHECKOUT: 'frontdesk.checkout',
  FRONTDESK_ROOM_CHANGE: 'frontdesk.room_change',
  
  // Billing
  BILLING_VIEW: 'billing.view',
  BILLING_CREATE: 'billing.create',
  BILLING_UPDATE: 'billing.update',
  BILLING_PROCESS_PAYMENT: 'billing.process_payment',
  BILLING_REFUND: 'billing.refund',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_FINANCIAL: 'analytics.financial',
  ANALYTICS_OPERATIONAL: 'analytics.operational',
  
  // System
  SYSTEM_SETTINGS: 'system.settings',
  USER_MANAGEMENT: 'users.manage',
  AUDIT_LOGS: 'audit.view',
} as const;

/**
 * JSON type for JSONB columns
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Database schema types
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      room_types: {
        Row: {
          id: string
          name: string
          description: string | null
          base_price: number
          max_adults: number
          max_children: number
          amenities: Json | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_price: number
          max_adults: number
          max_children: number
          amenities?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          base_price?: number
          max_adults?: number
          max_children?: number
          amenities?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      rooms: {
        Row: {
          id: string
          room_type_id: string
          room_number: string
          floor: number
          status: RoomStatus
          features: Json | null
          last_cleaned_at: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          room_type_id: string
          room_number: string
          floor: number
          status?: RoomStatus
          features?: Json | null
          last_cleaned_at?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          room_type_id?: string
          room_number?: string
          floor?: number
          status?: RoomStatus
          features?: Json | null
          last_cleaned_at?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      guests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string
          id_type: string | null
          id_number: string | null
          address: Json | null
          date_of_birth: string | null
          nationality: string | null
          preferences: Json | null
          emergency_contact: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          id_type?: string | null
          id_number?: string | null
          address?: Json | null
          date_of_birth?: string | null
          nationality?: string | null
          preferences?: Json | null
          emergency_contact?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          id_type?: string | null
          id_number?: string | null
          address?: Json | null
          date_of_birth?: string | null
          nationality?: string | null
          preferences?: Json | null
          emergency_contact?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      reservations: {
        Row: {
          id: string
          guest_id: string
          room_id: string
          check_in_date: string
          check_out_date: string
          actual_check_in: string | null
          actual_check_out: string | null
          num_adults: number
          num_children: number
          status: ReservationStatus
          special_requests: string | null
          total_amount: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          room_id: string
          check_in_date: string
          check_out_date: string
          actual_check_in?: string | null
          actual_check_out?: string | null
          num_adults?: number
          num_children?: number
          status?: ReservationStatus
          special_requests?: string | null
          total_amount: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          room_id?: string
          check_in_date?: string
          check_out_date?: string
          actual_check_in?: string | null
          actual_check_out?: string | null
          num_adults?: number
          num_children?: number
          status?: ReservationStatus
          special_requests?: string | null
          total_amount?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          reservation_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          status: InvoiceStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          invoice_number: string
          issue_date?: string
          due_date: string
          subtotal: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          status?: InvoiceStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          status?: InvoiceStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_line_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          item_type: string
          quantity: number
          unit_price: number
          total_price: number
          tax_rate: number
          tax_amount: number
          posting_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          item_type: string
          quantity?: number
          unit_price: number
          total_price: number
          tax_rate?: number
          tax_amount?: number
          posting_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          item_type?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          tax_rate?: number
          tax_amount?: number
          posting_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_method: PaymentMethod
          payment_date: string
          transaction_ref: string | null
          status: PaymentStatus
          notes: string | null
          processed_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_method: PaymentMethod
          payment_date?: string
          transaction_ref?: string | null
          status?: PaymentStatus
          notes?: string | null
          processed_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_method?: PaymentMethod
          payment_date?: string
          transaction_ref?: string | null
          status?: PaymentStatus
          notes?: string | null
          processed_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      deposits: {
        Row: {
          id: string
          reservation_id: string
          deposit_type: string
          amount: number
          collected_date: string
          refund_date: string | null
          refund_amount: number | null
          status: string
          payment_method: PaymentMethod
          transaction_ref: string | null
          notes: string | null
          collected_by: string
          refunded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          deposit_type?: string
          amount: number
          collected_date?: string
          refund_date?: string | null
          refund_amount?: number | null
          status?: string
          payment_method: PaymentMethod
          transaction_ref?: string | null
          notes?: string | null
          collected_by: string
          refunded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          deposit_type?: string
          amount?: number
          collected_date?: string
          refund_date?: string | null
          refund_amount?: number | null
          status?: string
          payment_method?: PaymentMethod
          transaction_ref?: string | null
          notes?: string | null
          collected_by?: string
          refunded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pricing_rules: {
        Row: {
          id: string
          name: string
          description: string | null
          rule_type: string
          room_type_id: string | null
          priority: number
          discount_type: string
          discount_value: number
          start_date: string | null
          end_date: string | null
          days_of_week: number[] | null
          min_nights: number | null
          advance_booking_days: number | null
          is_active: boolean
          conditions: Json | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          rule_type: string
          room_type_id?: string | null
          priority?: number
          discount_type?: string
          discount_value: number
          start_date?: string | null
          end_date?: string | null
          days_of_week?: number[] | null
          min_nights?: number | null
          advance_booking_days?: number | null
          is_active?: boolean
          conditions?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          rule_type?: string
          room_type_id?: string | null
          priority?: number
          discount_type?: string
          discount_value?: number
          start_date?: string | null
          end_date?: string | null
          days_of_week?: number[] | null
          min_nights?: number | null
          advance_booking_days?: number | null
          is_active?: boolean
          conditions?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      refunds: {
        Row: {
          id: string
          payment_id: string
          amount: number
          reason: string
          refund_method: PaymentMethod
          transaction_ref: string | null
          status: string
          notes: string | null
          requested_by: string
          approved_by: string | null
          processed_by: string | null
          created_at: string
          approved_at: string | null
          processed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          amount: number
          reason: string
          refund_method: PaymentMethod
          transaction_ref?: string | null
          status?: string
          notes?: string | null
          requested_by: string
          approved_by?: string | null
          processed_by?: string | null
          created_at?: string
          approved_at?: string | null
          processed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          amount?: number
          reason?: string
          refund_method?: PaymentMethod
          transaction_ref?: string | null
          status?: string
          notes?: string | null
          requested_by?: string
          approved_by?: string | null
          processed_by?: string | null
          created_at?: string
          approved_at?: string | null
          processed_at?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
      }
      guest_documents: {
        Row: {
          id: string
          guest_id: string
          document_type: string
          document_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          document_type: string
          document_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          document_type?: string
          document_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          module: string
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          module: string
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          module?: string
          action?: string
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role: UserRole
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role: UserRole
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          permission_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      financial_transactions: {
        Row: {
          transaction_type: string
          id: string
          invoice_id: string | null
          reservation_id: string | null
          amount: number
          payment_method: PaymentMethod
          transaction_date: string | null
          transaction_ref: string | null
          status: string
          handled_by: string
          created_at: string
        }
      }
      daily_revenue_summary: {
        Row: {
          business_date: string
          cash_total: number
          credit_card_total: number
          debit_card_total: number
          bank_transfer_total: number
          other_total: number
          total_revenue: number
          transaction_count: number
          reservation_count: number
        }
      }
      outstanding_balances: {
        Row: {
          invoice_id: string
          reservation_id: string
          invoice_number: string
          guest_id: string
          guest_name: string
          guest_email: string | null
          guest_phone: string | null
          total_amount: number
          paid_amount: number
          balance_due: number
          due_date: string
          payment_urgency: string
          invoice_status: InvoiceStatus
          check_out_date: string
          invoice_date: string
        }
      }
      revenue_by_room_type: {
        Row: {
          room_type_id: string
          room_type_name: string
          month: string
          reservation_count: number
          total_revenue: number
          average_revenue: number
          cash_revenue: number
          card_revenue: number
        }
      }
    }
    Functions: {
      check_room_availability: {
        Args: {
          p_room_id: string
          p_check_in: string
          p_check_out: string
          p_exclude_reservation_id?: string
        }
        Returns: boolean
      }
      calculate_reservation_total: {
        Args: {
          p_reservation_id: string
        }
        Returns: number
      }
      find_available_rooms: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_room_type_id?: string
          p_min_occupancy?: number
        }
        Returns: Array<{
          id: string
          room_number: string
          floor: number
          room_type_name: string
          base_price: number
          max_adults: number
          max_children: number
        }>
      }
      calculate_room_charges: {
        Args: {
          p_room_type_id: string
          p_check_in_date: string
          p_check_out_date: string
        }
        Returns: Array<{
          num_nights: number
          base_amount: number
          discount_amount: number
          final_amount: number
          applied_rules: Json
        }>
      }
      generate_invoice_number: {
        Args: Record<string, never>
        Returns: string
      }
      create_invoice_for_reservation: {
        Args: {
          p_reservation_id: string
          p_tax_rate?: number
        }
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      room_status: RoomStatus
      reservation_status: ReservationStatus
      invoice_status: InvoiceStatus
      payment_method: PaymentMethod
      payment_status: PaymentStatus
      audit_action: 'INSERT' | 'UPDATE' | 'DELETE'
    }
  }
}

/**
 * Helper types for database operations
 */
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

/**
 * Reservation with joined guest and room data
 */
export interface ReservationWithDetails extends Reservation {
  guest?: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  }
  room?: {
    id: string
    room_number: string
    floor: number
    room_type?: {
      id: string
      name: string
      base_price: number
    }
  }
  created_by_profile?: {
    id: string
    full_name: string | null
  }
}

/**
 * Available room search result
 */
export interface AvailableRoom {
  id: string
  room_number: string
  floor: number
  room_type_name: string
  base_price: number
  max_adults: number
  max_children: number
}

/**
 * Availability search filters
 */
export interface AvailabilitySearchFilters {
  check_in_date: string
  check_out_date: string
  num_adults: number
  num_children: number
  room_type_id?: string
}

/**
 * Reservation search filters
 */
export interface ReservationFilters {
  status?: ReservationStatus | 'all'
  guest_name?: string
  room_number?: string
  check_in_from?: string
  check_in_to?: string
  check_out_from?: string
  check_out_to?: string
}
/**
 * Invoice types
 */
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

/**
 * Invoice Line Item types
 */
export type InvoiceLineItem = Database['public']['Tables']['invoice_line_items']['Row']
export type InvoiceLineItemInsert = Database['public']['Tables']['invoice_line_items']['Insert']
export type InvoiceLineItemUpdate = Database['public']['Tables']['invoice_line_items']['Update']

/**
 * Payment types
 */
export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

/**
 * Deposit types
 */
export type Deposit = Database['public']['Tables']['deposits']['Row']
export type DepositInsert = Database['public']['Tables']['deposits']['Insert']
export type DepositUpdate = Database['public']['Tables']['deposits']['Update']

/**
 * Pricing Rule types
 */
export type PricingRule = Database['public']['Tables']['pricing_rules']['Row']
export type PricingRuleInsert = Database['public']['Tables']['pricing_rules']['Insert']
export type PricingRuleUpdate = Database['public']['Tables']['pricing_rules']['Update']

/**
 * Refund types
 */
export type Refund = Database['public']['Tables']['refunds']['Row']
export type RefundInsert = Database['public']['Tables']['refunds']['Insert']
export type RefundUpdate = Database['public']['Tables']['refunds']['Update']

/**
 * View types
 */
export type FinancialTransaction = Database['public']['Views']['financial_transactions']['Row']
export type DailyRevenueSummary = Database['public']['Views']['daily_revenue_summary']['Row']
export type OutstandingBalance = Database['public']['Views']['outstanding_balances']['Row']
export type RevenueByRoomType = Database['public']['Views']['revenue_by_room_type']['Row']

/**
 * Invoice with full details
 */
export interface InvoiceWithDetails extends Invoice {
  reservation?: {
    id: string
    guest_id: string
    room_id: string
    check_in_date: string
    check_out_date: string
    guest?: {
      id: string
      first_name: string
      last_name: string
      email: string | null
      phone: string | null
    }
    room?: {
      id: string
      room_number: string
      room_type?: {
        id: string
        name: string
      }
    }
  }
  line_items?: InvoiceLineItem[]
  payments?: Payment[]
  total_paid?: number
  balance_due?: number
}

/**
 * Folio (current charges for a reservation)
 */
export interface Folio {
  reservation_id: string
  guest_name: string
  room_number: string
  check_in_date: string
  check_out_date: string
  nights: number
  room_charges: number
  additional_charges: InvoiceLineItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payments: Payment[]
  deposits: Deposit[]
  balance_due: number
}

/**
 * Room charge calculation result
 */
export interface RoomChargeCalculation {
  num_nights: number
  base_amount: number
  discount_amount: number
  final_amount: number
  applied_rules: Json
}

/**
 * Payment summary for dashboard
 */
export interface PaymentSummary {
  today_revenue: number
  month_revenue: number
  outstanding_balance: number
  payment_method_breakdown: {
    cash: number
    credit_card: number
    debit_card: number
    bank_transfer: number
    other: number
  }
}

/**
 * Invoice filters
 */
export interface InvoiceFilters {
  status?: InvoiceStatus | 'all'
  guest_name?: string
  invoice_number?: string
  from_date?: string
  to_date?: string
  has_balance?: boolean
}

/**
 * Payment filters
 */
export interface PaymentFilters {
  payment_method?: PaymentMethod | 'all'
  status?: PaymentStatus | 'all'
  from_date?: string
  to_date?: string
  processed_by?: string
}