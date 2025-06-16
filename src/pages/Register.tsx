
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
});

type FormData = z.infer<typeof formSchema>;

const Register = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      residentChurch: '',
      contact: '',
      email: '',
    },
  });

  const calculateAmount = (position: string, accommodation: string) => {
    const baseAmounts = {
      'Delegate': 500,
      'Usher': 500,
      'Media & Technical Team': 500,
      'Hospitality Crew': 500,
      'Praise & Worship Team': 500,
      'Host': 1000,
      'Pastor': 1000,
    };

    let amount = baseAmounts[position as keyof typeof baseAmounts] || 500;
    
    if (accommodation === 'Boarder' && amount === 500) {
      amount = 1000;
    }

    return amount;
  };

  const onSubmit = (data: FormData) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed && formData) {
      const amount = calculateAmount(formData.position, formData.accommodationMode);
      
      toast({
        title: "Registration Initiated",
        description: `Please proceed to payment. Amount: KSH ${amount}`,
      });

      // Here you would typically redirect to payment processing
      // For now, we'll show a success message
      setTimeout(() => {
        toast({
          title: "Registration Successful!",
          description: "Your ticket has been generated and sent to your email.",
        });
        setShowConfirmation(false);
        form.reset();
      }, 2000);
    } else {
      setShowConfirmation(false);
    }
  };

  if (showConfirmation && formData) {
    const amount = calculateAmount(formData.position, formData.accommodationMode);
    
    return (
      <div className="min-h-screen bg-conference-lightGrey py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-conference-maroon to-conference-navy text-white rounded-t-lg">
              <CardTitle className="text-2xl">Confirm Your Registration</CardTitle>
              <CardDescription className="text-gray-200">
                Please review your details before proceeding to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-conference-navy">Name:</Label>
                    <p className="text-gray-700">{formData.name}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-conference-navy">Church:</Label>
                    <p className="text-gray-700">{formData.residentChurch}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-conference-navy">Contact:</Label>
                    <p className="text-gray-700">{formData.contact}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-conference-navy">Email:</Label>
                    <p className="text-gray-700">{formData.email}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-conference-navy">Position:</Label>
                    <p className="text-gray-700">{formData.position}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-conference-navy">Accommodation:</Label>
                    <p className="text-gray-700">{formData.accommodationMode}</p>
                  </div>
                </div>
                
                <div className="bg-conference-gold/20 p-4 rounded-lg">
                  <Label className="font-bold text-conference-navy text-lg">Total Amount:</Label>
                  <p className="text-2xl font-bold text-conference-maroon">KSH {amount}</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-600">Are you sure these details are correct?</p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => handleConfirmation(true)}
                    className="bg-conference-maroon hover:bg-conference-maroon/90 px-8"
                  >
                    Yes, Proceed to Payment
                  </Button>
                  <Button 
                    onClick={() => handleConfirmation(false)}
                    variant="outline"
                    className="border-conference-navy text-conference-navy hover:bg-conference-navy hover:text-white px-8"
                  >
                    No, Edit Details
                  </Button>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <Button 
                  type="submit" 
                  className="w-full btn-conference text-lg py-6"
                >
                  Register
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
