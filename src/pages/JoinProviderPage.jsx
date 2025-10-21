import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Briefcase, Mail, MapPin, Phone, User } from 'lucide-react';

const JoinProviderPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "✅ Registration Submitted!",
      description: "Thank you for your interest! We'll review your application and get back to you soon.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Join as a Provider | HealthProvida</title>
        <meta name="description" content="Register your clinic or healthcare service with HealthProvida and connect with more patients. Join our network to increase your visibility and streamline your operations." />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
            Join the HealthProvida Network
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Expand your reach, connect with more patients, and streamline your clinic's operations. Fill out the form below to start your journey with us.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:col-span-3"
          >
            <Card className="shadow-2xl border-t-4 border-blue-500">
              <CardHeader>
                <CardTitle className="text-3xl">Clinic Registration</CardTitle>
                <CardDescription>Please provide your clinic's details. All fields are required.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clinicName">Clinic Name</Label>
                      <Input id="clinicName" placeholder="e.g., Sunshine Medical Center" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input id="specialty" placeholder="e.g., General Practice, Dentistry" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Health St, Capital City" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="contact@sunshinemedical.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input id="contactPerson" placeholder="Dr. Jane Doe" required />
                    </div>
                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="md:col-span-2 space-y-8"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Join Us?</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <Briefcase className="w-5 h-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
                  <span><span className="font-semibold">Increase Visibility:</span> Reach thousands of potential patients actively seeking care.</span>
                </li>
                <li className="flex items-start">
                  <User className="w-5 h-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                  <span><span className="font-semibold">Optimize Bookings:</span> Reduce no-shows and fill your schedule efficiently.</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1 text-teal-500 flex-shrink-0" />
                  <span><span className="font-semibold">Streamline Operations:</span> Simplify administrative tasks with our powerful tools.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-4">Our provider support team is here to assist you with the registration process.</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span>(555) 987-PROV</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="w-5 h-5 text-green-500" />
                  <span>partners@healthprovida.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default JoinProviderPage;