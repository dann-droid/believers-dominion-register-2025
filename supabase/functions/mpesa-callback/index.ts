
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const merchantRequestId = stkCallback.MerchantRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Find the registration by checkout request ID
    const { data: registration, error: findError } = await supabase
      .from('registrations')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .single();

    if (findError || !registration) {
      console.error('Registration not found:', findError);
      return new Response('Registration not found', { status: 404 });
    }

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      let mpesaReceiptNumber = '';
      let phoneNumber = '';
      let transactionDate = '';

      if (callbackMetadata && callbackMetadata.Item) {
        for (const item of callbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          } else if (item.Name === 'PhoneNumber') {
            phoneNumber = item.Value;
          } else if (item.Name === 'TransactionDate') {
            transactionDate = item.Value;
          }
        }
      }

      // Update registration as paid
      const { error: updateError } = await supabase
        .from('registrations')
        .update({
          payment_status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate,
          payment_phone: phoneNumber,
        })
        .eq('id', registration.id);

      if (updateError) {
        console.error('Failed to update registration:', updateError);
      } else {
        console.log(`Payment successful for registration ${registration.id}`);
        
        // Generate ticket (you can extend this to send email)
        const ticketNumber = `BDC2025-${registration.id.toString().padStart(6, '0')}`;
        
        await supabase
          .from('registrations')
          .update({ ticket_number: ticketNumber })
          .eq('id', registration.id);

        console.log(`Ticket generated: ${ticketNumber} for ${registration.name}`);
      }

    } else {
      // Payment failed
      await supabase
        .from('registrations')
        .update({
          payment_status: 'failed',
          failure_reason: resultDesc,
        })
        .eq('id', registration.id);

      console.log(`Payment failed for registration ${registration.id}: ${resultDesc}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('Callback processing error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

serve(handler);
