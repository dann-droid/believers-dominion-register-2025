
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  phoneNumber: string;
  amount: number;
  registrationData: {
    name: string;
    email: string;
    residentChurch: string;
    contact: string;
    position: string;
    accommodationMode: string;
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Get M-Pesa access token
async function getMpesaToken(): Promise<string> {
  const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials not configured');
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to get M-Pesa token: ${data.error_description || 'Unknown error'}`);
  }

  return data.access_token;
}

// Initiate STK Push
async function initiateSTKPush(token: string, phoneNumber: string, amount: number, registrationId: string) {
  const shortcode = Deno.env.get('MPESA_SHORTCODE');
  const passkey = Deno.env.get('MPESA_PASSKEY');
  
  if (!shortcode || !passkey) {
    throw new Error('M-Pesa shortcode or passkey not configured');
  }

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = btoa(`${shortcode}${passkey}${timestamp}`);
  
  // Format phone number (ensure it starts with 254)
  let formattedPhone = phoneNumber.replace(/^\+/, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone;
  }

  const stkPushData = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: '254759539169', // Updated to use the specific number
    PhoneNumber: formattedPhone,
    CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`,
    AccountReference: `BDC2025-${registrationId}`,
    TransactionDesc: 'BDC 2025 Conference Registration',
  };

  const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stkPushData),
  });

  const data = await response.json();
  console.log('STK Push Response:', data);
  
  if (!response.ok || data.ResponseCode !== '0') {
    throw new Error(`STK Push failed: ${data.errorMessage || data.ResponseDescription || 'Unknown error'}`);
  }

  return data;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount, registrationData }: PaymentRequest = await req.json();

    console.log('Processing payment request:', { phoneNumber, amount, registrationData });

    // Create registration record
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        name: registrationData.name,
        email: registrationData.email,
        resident_church: registrationData.residentChurch,
        contact: registrationData.contact,
        position: registrationData.position,
        accommodation_mode: registrationData.accommodationMode,
        amount: amount,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (regError) {
      console.error('Registration creation failed:', regError);
      throw new Error(`Failed to create registration: ${regError.message}`);
    }

    console.log('Registration created:', registration);

    // Get M-Pesa token and initiate STK Push
    const token = await getMpesaToken();
    const stkResponse = await initiateSTKPush(token, phoneNumber, amount, registration.id);

    // Update registration with checkout request ID
    await supabase
      .from('registrations')
      .update({ 
        checkout_request_id: stkResponse.CheckoutRequestID,
        merchant_request_id: stkResponse.MerchantRequestID 
      })
      .eq('id', registration.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment initiated. Please check your phone for M-Pesa prompt.',
        registrationId: registration.id,
        checkoutRequestId: stkResponse.CheckoutRequestID,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment initiation failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
