
-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  resident_church TEXT NOT NULL,
  contact TEXT NOT NULL,
  position TEXT NOT NULL,
  accommodation_mode TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  mpesa_receipt_number TEXT,
  transaction_date TEXT,
  payment_phone TEXT,
  ticket_number TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for faster lookups
CREATE INDEX idx_registrations_checkout_request_id ON public.registrations(checkout_request_id);
CREATE INDEX idx_registrations_ticket_number ON public.registrations(ticket_number);
CREATE INDEX idx_registrations_email ON public.registrations(email);
