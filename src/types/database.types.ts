export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      currencies: {
        Row: {
          code: string;
          name: string;
          symbol: string;
        };
        Insert: {
          code: string;
          name: string;
          symbol: string;
        };
        Update: {
          code?: string;
          name?: string;
          symbol?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          currency_code: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          currency_code?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          currency_code?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_currency_code_fkey";
            columns: ["currency_code"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string;
          color: string;
          type: "expense" | "income" | "both";
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          icon: string;
          color: string;
          type: "expense" | "income" | "both";
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          type?: "expense" | "income" | "both";
          is_system?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          type: "expense" | "income";
          description: string;
          transaction_date: string;
          notes: string | null;
          recurring_transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          type: "expense" | "income";
          description: string;
          transaction_date: string;
          notes?: string | null;
          recurring_transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          type?: "expense" | "income";
          description?: string;
          transaction_date?: string;
          notes?: string | null;
          recurring_transaction_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          period_type: "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          period_type: "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          period_type?: "weekly" | "monthly" | "yearly";
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      budget_allocations: {
        Row: {
          id: string;
          budget_id: string;
          category_id: string;
          amount_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          budget_id: string;
          category_id: string;
          amount_limit: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          budget_id?: string;
          category_id?: string;
          amount_limit?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_allocations_budget_id_fkey";
            columns: ["budget_id"];
            isOneToOne: false;
            referencedRelation: "budgets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budget_allocations_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          target_date: string | null;
          icon: string;
          color: string;
          status: "active" | "completed" | "paused" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          target_date?: string | null;
          icon?: string;
          color?: string;
          status?: "active" | "completed" | "paused" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          target_date?: string | null;
          icon?: string;
          color?: string;
          status?: "active" | "completed" | "paused" | "cancelled";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "savings_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      goal_contributions: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          amount: number;
          contribution_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          amount: number;
          contribution_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          amount?: number;
          contribution_date?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "savings_goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_contributions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      recurring_transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          type: "expense" | "income";
          description: string;
          frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string | null;
          last_generated_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          type: "expense" | "income";
          description: string;
          frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
          start_date: string;
          end_date?: string | null;
          last_generated_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          type?: "expense" | "income";
          description?: string;
          frequency?: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
          start_date?: string;
          end_date?: string | null;
          last_generated_date?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_goal_progress: {
        Args: { goal_id: string };
        Returns: { current_amount: number; progress_pct: number };
      };
      get_budget_utilization: {
        Args: { budget_id: string };
        Returns: {
          category_id: string;
          category_name: string;
          color: string;
          icon: string;
          amount_limit: number;
          amount_spent: number;
          utilization_pct: number;
        }[];
      };
      get_spending_by_category: {
        Args: { p_start_date: string; p_end_date: string };
        Returns: {
          category_id: string;
          category_name: string;
          color: string;
          icon: string;
          total: number;
          percentage: number;
        }[];
      };
    };
    Enums: {
      transaction_type: "expense" | "income";
      budget_period_type: "weekly" | "monthly" | "yearly";
      goal_status: "active" | "completed" | "paused" | "cancelled";
      recurring_frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
      category_type: "expense" | "income" | "both";
    };
  };
};
