/** Shared types/constants for clients — mirrors lib/leads.ts's shape. */

export interface Client {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  industry: string | null;
  account_manager: string | null;
  notes: string | null;
  converted_from_lead_id: string | null;
}
