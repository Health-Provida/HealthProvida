import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Zap, Users, Target, ShieldCheck, HeartPulse, Briefcase, Hotel as Hospital, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const AudienceCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center"
  >
    <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mx-auto mb-4 shadow-md">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-700 text-sm">{description}</p>
  </motion.div>
);

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About HealthProvida | Revolutionizing Healthcare Access</title>
        <meta name="description" content="Learn about HealthProvida's mission to streamline healthcare provider network management and simplify access for insurers, employers, providers, and patients in Sub-Saharan Africa." />
      </Helmet>

      <div className="overflow-x-hidden">
        <section className="hero-gradient text-white py-24 text-center relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              About HealthProvida
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100"
            >
              Real-time provider network management and seamless scheduling for underserved healthcare systems in Sub-Saharan Africa.
            </motion.p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  The Problem We're Solving
                </h2>
                <p className="text-gray-600 mb-4">
                  In Sub-Saharan Africa, healthcare access is hindered by fragmented provider directories, a lack of real-time information, and frustrating scheduling delays. This inefficiency affects everyone—from patients seeking care to insurers managing networks.
                </p>
                <p className="text-gray-600">
                  HealthProvida was born from a desire to bridge this gap, creating a transparent and efficient healthcare ecosystem for all.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative h-80"
              >
                <img class="absolute w-full h-full object-cover rounded-xl shadow-2xl" alt="Doctor consulting with a patient in a modern clinic" src="https://images.unsplash.com/photo-1584516150909-c43483ee7932" />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Our Solution
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto text-gray-600 mb-12"
            >
              We consolidate provider data into a centralized, cloud-based system, enabling stakeholders to access real-time updates, manage appointments, and optimize healthcare resources effectively.
            </motion.p>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="w-6 h-6 text-blue-600" />}
                title="Real-Time Directory"
                description="Access up-to-date provider availability and capacity, eliminating guesswork and delays."
                delay={0.1}
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-green-600" />}
                title="Seamless Scheduling"
                description="Simplified booking tools with automated reminders for patients, providers, and insurers."
                delay={0.2}
              />
              <FeatureCard
                icon={<Target className="w-6 h-6 text-teal-600" />}
                title="Actionable Analytics"
                description="Gain insights into network utilization and efficiency to improve operational performance."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-green-600">
          <div className="container mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white mb-12"
            >
              Who We Serve
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <AudienceCard
                icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
                title="Health Insurers"
                description="Enhance network visibility and improve member satisfaction with accurate provider data."
                delay={0.1}
              />
              <AudienceCard
                icon={<Briefcase className="w-8 h-8 text-green-600" />}
                title="Large Employers"
                description="Streamline employee healthcare access and reduce productivity loss due to downtime."
                delay={0.2}
              />
              <AudienceCard
                icon={<Hospital className="w-8 h-8 text-teal-600" />}
                title="Healthcare Providers"
                description="Increase patient volume, optimize schedules, and reduce administrative overhead."
                delay={0.3}
              />
              <AudienceCard
                icon={<UserCheck className="w-8 h-8 text-indigo-600" />}
                title="Patients"
                description="Find verified providers, reduce wait times, and manage appointments with ease."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 text-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <HeartPulse className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Join Us in Transforming Healthcare
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600 mb-8">
                Whether you're a patient seeking care or a provider looking to optimize your practice, HealthProvida is your partner in building a healthier future for Sub-Saharan Africa.
              </p>
              <Link to="/">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  Find a Clinic Near You
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;