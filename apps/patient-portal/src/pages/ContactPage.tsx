import React from 'react';
// import { Helmet } from 'react-helmet';
// import { motion } from 'framer-motion';
// import { Zap, Users, Target, ShieldCheck, HeartPulse, Briefcase, Hotel as Hospital, UserCheck } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <>
        <section id="contact">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">We're Here to Help</h1>
                    <p className="text-lg text-gray-600">Have a question or need support? Our team is ready to assist you.</p>
                </div>
                <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-[#246db5] mb-4">For Patients</h2>
                        <p className="text-gray-700 mb-4">If you have questions about booking an appointment, finding a provider, or using the platform, please contact our Patient Support team.</p>
                        <p className="text-gray-700"><strong>Email:</strong> support@healthprovida.com.ng</p>
                        <p className="text-gray-700"><strong>Phone:</strong> 01-229-0001 (Mon-Fri, 9 AM - 5 PM)</p>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-[#10B981] mb-4">For Providers</h2>
                        <p className="text-gray-700 mb-4">For assistance with your profile, bookings, or any other provider-related inquiries, please contact our Provider Success team.</p>
                        <p className="text-gray-700"><strong>Email:</strong> partners@healthprovida.com.ng</p>
                        <p className="text-gray-700"><strong>Phone:</strong> 01-229-0002 (Mon-Fri, 9 AM - 5 PM)</p>
                    </div>
                    <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Office</h2>
                        <p className="text-gray-700">Health Provida Technologies Ltd.</p>
                        <p className="text-gray-700">Plot 17, Step one, Aso Garden Estate, Karsana, Abuja</p>
                    </div>
                </div>
            </div>
        </section>
    </>
  );
};

export default ContactPage;