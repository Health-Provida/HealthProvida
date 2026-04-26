import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Briefcase, Hotel as Hospital, UserCheck, CalendarDays, BarChart2, Search, UserCircle } from 'lucide-react';
import insurer from '../components/ui/insurer.jpg';
import employer from '../components/ui/employer.jpg';
import provider from "../components/ui/provider.jpg"
import patient from "../components/ui/patient.jpg"
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center"
  >
    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full mb-6">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 flex-grow">{description}</p>
  </motion.div>
);

const AudienceSection = ({ icon, title, description, features, imageSrc, imageAlt, reverse = false }) => (
  <div className="container mx-auto px-4 py-16">
    <div className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:grid-flow-col-dense' : ''}`}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className={`relative h-96 rounded-xl overflow-hidden shadow-2xl ${reverse ? 'md:col-start-2' : ''}`}
      >
        <img class="absolute w-full h-full object-cover" alt={imageAlt} src={imageSrc} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className={`${reverse ? 'md:col-start-1' : ''}`}
      >
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-md mr-4">
            {icon}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  </div>
);

const ServicesPage = () => {
    const navigate = useNavigate();
    // const location = useLocation();
    // const currentPagePath = location.pathname;
  
    // // Handle scrolling to search after navigation
    // useEffect(() => {
    //   if (shouldScroll && currentPagePath === '/' && searchRef.current) {
    //     // Small delay to ensure page is rendered
    //     setTimeout(() => {
    //       searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //       setTimeout(() => searchRef.current?.focus(), 500);
    //       setShouldScroll(false);
    //     }, 100);
    //   }
    // }, [currentPagePath, shouldScroll]);
  
     const handleSearchClick = () => {
      // Navigate to home page with state to trigger scroll
      navigate('/', { state: { scrollToSearch: true } });
    };
  
  return (
    <>
      <Helmet>
        <title>Our Services | HealthProvida</title>
        <meta name="description" content="Explore the services offered by HealthProvida, including our real-time provider directory, appointment scheduling, patient portal, and analytics dashboard for all healthcare stakeholders." />
      </Helmet>

      <div className="overflow-x-hidden">
        <section className="hero-gradient text-white py-24 text-center relative">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              Our Platform Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100"
            >
              Empowering insurers, employers, providers, and patients with a unified, real-time healthcare platform.
            </motion.p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Core Features for Everyone
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto text-gray-600 mb-12"
            >
              HealthProvida is built on a foundation of powerful, intuitive features designed to streamline healthcare access and management for all.
            </motion.p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ServiceCard
                icon={<Search className="w-8 h-8 text-blue-600" />}
                title="Real-Time Directory"
                description="Instantly find healthcare providers with updated availability and capacity information."
                delay={0.1}
              />
              <ServiceCard
                icon={<CalendarDays className="w-8 h-8 text-green-600" />}
                title="Appointment Scheduling"
                description="Book, manage, and receive reminders for appointments with our simplified tools."
                delay={0.2}
              />
              <ServiceCard
                icon={<UserCircle className="w-8 h-8 text-teal-600" />}
                title="Patient Portal"
                description="A user-friendly interface for patients to manage their healthcare journey from one place."
                delay={0.3}
              />
              <ServiceCard
                icon={<BarChart2 className="w-8 h-8 text-indigo-600" />}
                title="Analytics Dashboard"
                description="Actionable insights into network utilization and efficiency for data-driven decisions."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        <div className="bg-gradient-to-b from-gray-50 to-blue-50">
          <AudienceSection
            icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
            title="For Health Insurers"
            description="Manage your provider network with unparalleled efficiency and improve member satisfaction."
            features={[
              "Enhanced network visibility with real-time data.",
              "Reduced administrative overhead through automation.",
              "Improved member satisfaction with easier access to care.",
              "Actionable analytics to optimize network performance."
            ]}
            imageSrc={insurer}
            imageAlt="Insurance manager reviewing data on a tablet"
            reverse={false}
          />
        </div>

        <div className="bg-white">
          <AudienceSection
            icon={<Briefcase className="w-8 h-8 text-green-600" />}
            title="For Employers"
            description="Offer a seamless healthcare benefit that keeps your employees healthy and productive."
            features={[
              "Streamlined healthcare access for employees.",
              "Reduced employee downtime and absenteeism.",
              "Integration with existing HR systems via API.",
              "A valuable addition to your employee benefits package."
            ]}
            imageSrc={employer}
            imageAlt="HR manager presenting to a group of employees"
            reverse={true}
          />
        </div>

        <div className="bg-gradient-to-b from-gray-50 to-green-50">
          <AudienceSection
            icon={<Hospital className="w-8 h-8 text-teal-600" />}
            title="For Healthcare Providers"
            description="Increase your visibility, optimize your schedule, and focus on what matters most: your patients."
            features={[
              "Increased patient volume and visibility.",
              "Optimized scheduling and reduced no-shows.",
              "Streamlined administrative tasks.",
              "Easy management of your clinic's profile and availability."
            ]}
            imageAlt="Doctor smiling in a modern clinic hallway"
            imageSrc={provider}
            reverse={false}
            />
        </div>

        <div className="bg-white">
          <AudienceSection
            icon={<UserCheck className="w-8 h-8 text-indigo-600" />}
            title="For Patients"
            description="Take control of your healthcare with a simple, transparent, and convenient platform."
            features={[
              "Easily search for verified providers near you.",
              "Book appointments instantly based on real-time availability.",
              "Manage all your appointments and receive reminders.",
              "Reduced wait times and simplified access to quality care."
            ]}
            imageAlt="Patient using a smartphone to book an appointment"
            imageSrc={patient}
            reverse={true}
            />
        </div>

        <section className="py-16 md:py-24 text-center bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Experience the Future of Healthcare?
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600 mb-8">
                Join HealthProvida today and be part of the revolution in healthcare access and management across Sub-Saharan Africa.
              </p>
              {/* <Link to="/"> */}
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700" onClick={handleSearchClick}>
                  Get Started Now
                </Button>
              {/* </Link> */}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServicesPage;