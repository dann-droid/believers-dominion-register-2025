
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  residentChurch: z.string().min(2, 'Church name must be at least 2 characters'),
  contact: z.string().regex(/^\d+$/, 'Contact must contain only numbers'),
  email: z.string().email('Please enter a valid email address'),
  position: z.enum(['Delegate', 'Pastor', 'Host', 'Media & Technical Team', 'Usher', 'Hospitality Crew'], {
    required_error: 'Please select a position',
  }),
  accommodationMode: z.enum(['Daytime attendee', 'Boarder'], {
    required_error: 'Please select accommodation mode',
  }),
  phoneNumber: z.string().regex(/^(\+254|254|0)[0-9]{9}$/, 'Please enter a valid Kenyan phone number'),
});

type FormData = z.infer<typeof formSchema>;

const Register = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      residentChurch: '',
      contact: '',
      email: '',
      phoneNumber: '',
    },
  });

  const calculateAmount = (position: string, accommodation: string) => {
    const baseAmounts = {
      'Delegate': 500,
      'Usher': 500,
      'Media & Technical Team': 500,
      'Hospitality Crew': 500,
      'Host': 1000,
      'Pastor': 1000,
    };

    let amount = baseAmounts[position as keyof typeof baseAmounts] || 500;
    
    if (accommodation === 'Boarder' && amount === 500) {
      amount = 1000;
    }

    return amount;
  };

  const checkPaymentStatus = async (regId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { registrationId: regId }
      });

      if (error) throw error;

      setPaymentStatus(data.paymentStatus);
      
      if (data.paymentStatus === 'completed') {
        setTicketInfo(data);
        toast({
          title: "Payment Successful!",
          description: `Your ticket number is: ${data.ticketNumber}`,
        });
      } else if (data.paymentStatus === 'failed') {
        toast({
          title: "Payment Failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsProcessing(true);
    
    try {
      const amount = calculateAmount(data.position, data.accommodationMode);
      
      toast({
        title: "Processing Payment",
        description: "Initiating M-Pesa payment...",
      });

      const { data: response, error } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          phoneNumber: data.phoneNumber,
          amount: amount,
          registrationData: {
            name: data.name,
            email: data.email,
            residentChurch: data.residentChurch,
            contact: data.contact,
            position: data.position,
            accommodationMode: data.accommodationMode,
          }
        }
      });

      if (error) throw error;

      if (response.success) {
        setRegistrationId(response.registrationId);
        setPaymentStatus('pending');
        
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for M-Pesa prompt and enter your PIN.",
        });

        // Start polling for payment status
        const pollInterval = setInterval(async () => {
          await checkPaymentStatus(response.registrationId);
          
          // Stop polling after 2 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
          }, 120000);
        }, 5000);

      } else {
        throw new Error(response.error || 'Payment initiation failed');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'completed' && ticketInfo) {
    return (
      <div className="min-h-screen bg-conference-lightGrey py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Registration Successful!</CardTitle>
              <CardDescription className="text-gray-200">
                Your ticket has been generated
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-green-800 mb-2">Ticket Number</h3>
                  <p className="text-2xl font-mono text-green-900">{ticketInfo.ticketNumber}</p>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="font-semibold">Name:</span>
                    <span>{ticketInfo.registrationData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Position:</span>
                    <span>{ticketInfo.registrationData.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Accommodation:</span>
                    <span>{ticketInfo.registrationData.accommodationMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Amount Paid:</span>
                    <span>KSH {ticketInfo.registrationData.amount}</span>
                  </div>
                  {ticketInfo.mpesaReceipt && (
                    <div className="flex justify-between">
                      <span className="font-semibold">M-Pesa Receipt:</span>
                      <span>{ticketInfo.mpesaReceipt}</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Please save this ticket number. You will need it for conference entry.
                    A confirmation email will be sent to {ticketInfo.registrationData.email}.
                  </p>
                </div>

                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-conference-maroon hover:bg-conference-maroon/90"
                >
                  Register Another Person
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-conference-lightGrey py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Payment Processing</CardTitle>
              <CardDescription className="text-gray-200">
                Please complete the M-Pesa payment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-conference-maroon mx-auto"></div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Waiting for Payment</h3>
                  <p className="text-gray-600 mb-4">
                    Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
                  </p>
                  <p className="text-sm text-gray-500">
                    This page will automatically update once payment is confirmed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-conference-lightGrey py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-conference-maroon to-conference-navy text-white rounded-t-lg">
            <CardTitle className="text-3xl">Conference Registration</CardTitle>
            <CardDescription className="text-gray-200">
              Register for Believers Dominion Conference 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-conference-navy font-semibold">Full Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field}
                          className="border-gray-300 focus:border-conference-maroon focus:ring-conference-maroon"
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residentChurch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-conference-navy font-semibold">Resident Church *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your church name" 
                          {...field}
                          className="border-gray-300 focus:border-conference-maroon focus:ring-conference-maroon"
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-conference-navy font-semibold">Contact Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your phone number (numbers only)" 
                          {...field}
                          className="border-gray-300 focus:border-conference-maroon focus:ring-conference-maroon"
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-conference-navy font-semibold">Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter your email address" 
                          {...field}
                          className="border-gray-300 focus:border-conference-maroon focus:ring-conference-maroon"
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-conference-navy font-semibold">M-Pesa Phone Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 0712345678 or 254712345678" 
                          {...field}
                          className="border-gray-300 focus:border-conference-maroon focus:ring-conference-maroon"
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-conference-navy font-semibold">Position *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-conference-maroon focus:ring-conference-maroon">
                            <SelectValue placeholder="Select your position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Delegate">Delegate</SelectItem>
                          <SelectItem value="Pastor">Pastor</SelectItem>
                          <SelectItem value="Host">Host</SelectItem>
                          <SelectItem value="Media & Technical Team">Media & Technical Team</SelectItem>
                          <SelectItem value="Usher">Usher</SelectItem>
                          <SelectItem value="Hospitality Crew">Hospitality Crew</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accommodationMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-conference-navy font-semibold">Accommodation Mode *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                          disabled={isProcessing}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Daytime attendee" id="daytime" />
                            <Label htmlFor="daytime">Daytime attendee</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Boarder" id="boarder" />
                            <Label htmlFor="boarder">Boarder</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('position') && form.watch('accommodationMode') && (
                  <div className="bg-conference-gold/20 p-4 rounded-lg">
                    <Label className="font-bold text-conference-navy text-lg">Amount to Pay:</Label>
                    <p className="text-2xl font-bold text-conference-maroon">
                      KSH {calculateAmount(form.watch('position'), form.watch('accommodationMode'))}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-conference text-lg py-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
