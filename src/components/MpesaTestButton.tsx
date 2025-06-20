
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MpesaTestButton = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const testMpesaPayment = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number for testing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          phoneNumber: phoneNumber,
          amount: 5,
          registrationData: {
            name: "Test User",
            email: "test@example.com",
            residentChurch: "Test Church",
            contact: phoneNumber,
            position: "Delegate",
            accommodationMode: "Daytime attendee",
          }
        }
      });

      if (error) throw error;

      if (response.success) {
        toast({
          title: "Test Payment Initiated",
          description: "Check your phone for M-Pesa prompt (KShs 5)",
        });
      } else {
        throw new Error(response.error || 'Payment initiation failed');
      }

    } catch (error: any) {
      console.error('Test payment error:', error);
      toast({
        title: "Test Payment Failed",
        description: error.message || "Failed to initiate test payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">M-Pesa API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="test-phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <Input
            id="test-phone"
            type="text"
            placeholder="e.g., 0712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <Button 
          onClick={testMpesaPayment}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Test KShs 5 Payment'}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          This will create a test registration and initiate a KShs 5 M-Pesa payment
        </p>
      </CardContent>
    </Card>
  );
};

export default MpesaTestButton;
