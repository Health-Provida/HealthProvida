// import React from 'react';
// import { Helmet } from 'react-helmet';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { toast } from '@/components/ui/use-toast';
// import { Briefcase, Mail, MapPin, Phone, User } from 'lucide-react';

// const JoinProviderPage = () => {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     toast({
//       title: "✅ Registration Submitted!",
//       description: "Thank you for your interest! We'll review your application and get back to you soon.",
//     });
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Join as a Provider | HealthProvida</title>
//         <meta name="description" content="Register your clinic or healthcare service with HealthProvida and connect with more patients. Join our network to increase your visibility and streamline your operations." />
//       </Helmet>
//       <div className="container mx-auto px-4 py-16">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-12"
//         >
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
//             Join the HealthProvida Network
//           </h1>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Expand your reach, connect with more patients, and streamline your clinic's operations. Fill out the form below to start your journey with us.
//           </p>
//         </motion.div>

//         <div className="grid md:grid-cols-5 gap-12 items-start">
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.7, delay: 0.2 }}
//             className="md:col-span-3"
//           >
//             <Card className="shadow-2xl border-t-4 border-blue-500">
//               <CardHeader>
//                 <CardTitle className="text-3xl">Clinic Registration</CardTitle>
//                 <CardDescription>Please provide your clinic's details. All fields are required.</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="grid sm:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <Label htmlFor="clinicName">Clinic Name</Label>
//                       <Input id="clinicName" placeholder="e.g., Sunshine Medical Center" required />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="specialty">Specialty</Label>
//                       <Input id="specialty" placeholder="e.g., General Practice, Dentistry" required />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="address">Address</Label>
//                     <Input id="address" placeholder="123 Health St, Capital City" required />
//                   </div>
//                   <div className="grid sm:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <Label htmlFor="phone">Phone Number</Label>
//                       <Input id="phone" type="tel" placeholder="(555) 123-4567" required />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="email">Email Address</Label>
//                       <Input id="email" type="email" placeholder="contact@sunshinemedical.com" required />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                       <Label htmlFor="contactPerson">Contact Person</Label>
//                       <Input id="contactPerson" placeholder="Dr. Jane Doe" required />
//                     </div>
//                   <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
//                     Submit Application
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.7, delay: 0.4 }}
//             className="md:col-span-2 space-y-8"
//           >
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//               <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Join Us?</h3>
//               <ul className="space-y-4 text-gray-600">
//                 <li className="flex items-start">
//                   <Briefcase className="w-5 h-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
//                   <span><span className="font-semibold">Increase Visibility:</span> Reach thousands of potential patients actively seeking care.</span>
//                 </li>
//                 <li className="flex items-start">
//                   <User className="w-5 h-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
//                   <span><span className="font-semibold">Optimize Bookings:</span> Reduce no-shows and fill your schedule efficiently.</span>
//                 </li>
//                 <li className="flex items-start">
//                   <MapPin className="w-5 h-5 mr-3 mt-1 text-teal-500 flex-shrink-0" />
//                   <span><span className="font-semibold">Streamline Operations:</span> Simplify administrative tasks with our powerful tools.</span>
//                 </li>
//               </ul>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//               <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
//               <p className="text-gray-600 mb-4">Our provider support team is here to assist you with the registration process.</p>
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-3 text-gray-700">
//                   <Phone className="w-5 h-5 text-blue-500" />
//                   <span>(555) 987-PROV</span>
//                 </div>
//                 <div className="flex items-center space-x-3 text-gray-700">
//                   <Mail className="w-5 h-5 text-green-500" />
//                   <span>partners@healthprovida.com</span>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </>
//   );
// };

// import React, { useState } from 'react';
// import { Briefcase, Mail, MapPin, Phone, User, CheckCircle, ArrowRight, ArrowLeft, Stethoscope, Shield, Tag } from 'lucide-react';

// Pre-registered HMOs
// const availableHMOs = [
//   "Hygeia HMO",
//   "Avon Healthcare",
//   "Reliance HMO",
//   "AXA Mansard",
//   "MetroHealth HMO",
//   "Apex Healthcare",
//   "Total Health Trust",
//   "Wellness HMO",
//   "Sterling Health HMO",
//   "Clearline HMO"
// ];

// Common equipment options
// const commonEquipment = [
//   "X-Ray Machine",
//   "Ultrasound",
//   "ECG Monitor",
//   "CT Scan",
//   "MRI Machine",
//   "Laboratory",
//   "Pharmacy",
//   "Operating Theater",
//   "ICU Facilities",
//   "Dental Equipment",
//   "Dialysis Machine",
//   "Ambulance"
// ];

// Common specialties
// const commonSpecialties = [
//   "General Practice",
//   "Pediatrics",
//   "Cardiology",
//   "Dermatology",
//   "Orthopedics",
//   "Gynecology",
//   "Ophthalmology",
//   "Dentistry",
//   "Surgery",
//   "Emergency Medicine",
//   "Radiology",
//   "Neurology"
// ];

// export default function MultiStepProviderForm() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // Step 1
//     practitionerName: '',
//     practitionerType: '',
//     email: '',
//     phone: '',
//     address: '',
//     // Step 2
//     equipment: [],
//     tags: [],
//     specialties: [],
//     // Step 3
//     supportedHMOs: []
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const toggleArrayItem = (field, item) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: prev[field].includes(item)
//         ? prev[field].filter(i => i !== item)
//         : [...prev[field], item]
//     }));
//   };

//   const addCustomItem = (field, value) => {
//     if (value && !formData[field].includes(value)) {
//       setFormData(prev => ({
//         ...prev,
//         [field]: [...prev[field], value]
//       }));
//     }
//   };

//   const removeItem = (field, item) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: prev[field].filter(i => i !== item)
//     }));
//   };

//   const validateStep1 = () => {
//     return formData.practitionerName && 
//            formData.practitionerType && 
//            formData.email && 
//            formData.phone && 
//            formData.address;
//   };

//   const validateStep2 = () => {
//     return formData.equipment.length > 0 || 
//            formData.specialties.length > 0;
//   };

//   const handleNext = () => {
//     if (currentStep === 1 && !validateStep1()) {
//       alert('Please fill in all required fields');
//       return;
//     }
//     if (currentStep === 2 && !validateStep2()) {
//       alert('Please select at least one equipment or specialty');
//       return;
//     }
//     setCurrentStep(prev => prev + 1);
//   };

//   const handlePrevious = () => {
//     setCurrentStep(prev => prev - 1);
//   };

//   const handleSubmit = () => {
//     console.log('Form submitted:', formData);
//     alert('Registration submitted successfully! We will review your application and get back to you soon.');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
//             Join the HealthProvida Network
//           </h1>
//           <p className="text-gray-600">Register your healthcare facility in 3 easy steps</p>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             {[1, 2, 3].map((step) => (
//               <div key={step} className="flex items-center flex-1">
//                 <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
//                   currentStep >= step 
//                     ? 'bg-blue-600 text-white' 
//                     : 'bg-gray-200 text-gray-500'
//                 }`}>
//                   {currentStep > step ? <CheckCircle size={20} /> : step}
//                 </div>
//                 {step < 3 && (
//                   <div className={`flex-1 h-1 mx-2 ${
//                     currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
//                   }`} />
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between text-xs md:text-sm text-gray-600">
//             <span>Basic Info</span>
//             <span>Services</span>
//             <span>Insurance</span>
//           </div>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
//             {/* Step 1: Basic Information */}
//             {currentStep === 1 && (
//               <div className="space-y-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//                     <User className="w-6 h-6 text-blue-600" />
//                     Basic Information
//                   </h2>
//                   <p className="text-gray-600 text-sm">Tell us about your healthcare facility</p>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Practitioner Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="practitionerName"
//                       value={formData.practitionerName}
//                       onChange={handleInputChange}
//                       placeholder="e.g., Dr. Sarah Johnson Medical Center"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Practitioner Type <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       name="practitionerType"
//                       value={formData.practitionerType}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     >
//                       <option value="">Select type</option>
//                       <option value="Hospital">Hospital</option>
//                       <option value="Clinic">Clinic</option>
//                       <option value="Diagnostic Center">Diagnostic Center</option>
//                       <option value="Pharmacy">Pharmacy</option>
//                       <option value="Dental Clinic">Dental Clinic</option>
//                       <option value="Specialist Center">Specialist Center</option>
//                     </select>
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Email Address <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                         <input
//                           type="email"
//                           name="email"
//                           value={formData.email}
//                           onChange={handleInputChange}
//                           placeholder="contact@clinic.com"
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Phone Number <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                         <input
//                           type="tel"
//                           name="phone"
//                           value={formData.phone}
//                           onChange={handleInputChange}
//                           placeholder="+234 123 456 7890"
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Physical Address <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
//                       <textarea
//                         name="address"
//                         value={formData.address}
//                         onChange={handleInputChange}
//                         placeholder="123 Health Street, Medical District, Lagos"
//                         rows="3"
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Services & Facilities */}
//             {currentStep === 2 && (
//               <div className="space-y-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//                     <Stethoscope className="w-6 h-6 text-blue-600" />
//                     Services & Facilities
//                   </h2>
//                   <p className="text-gray-600 text-sm">What services and equipment do you offer?</p>
//                 </div>

//                 {/* Equipment */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Available Equipment
//                   </label>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
//                     {commonEquipment.map((item) => (
//                       <button
//                         key={item}
//                         type="button"
//                         onClick={() => toggleArrayItem('equipment', item)}
//                         className={`px-3 py-2 text-sm rounded-lg border-2 transition ${
//                           formData.equipment.includes(item)
//                             ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
//                             : 'border-gray-200 hover:border-blue-300 text-gray-700'
//                         }`}
//                       >
//                         {item}
//                       </button>
//                     ))}
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Add custom equipment (press Enter)"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     onKeyPress={(e) => {
//                       if (e.key === 'Enter') {
//                         e.preventDefault();
//                         addCustomItem('equipment', e.target.value);
//                         e.target.value = '';
//                       }
//                     }}
//                   />
//                   {formData.equipment.length > 0 && (
//                     <div className="mt-3 flex flex-wrap gap-2">
//                       {formData.equipment.map((item) => (
//                         <span
//                           key={item}
//                           className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
//                         >
//                           {item}
//                           <button
//                             type="button"
//                             onClick={() => removeItem('equipment', item)}
//                             className="hover:text-red-600"
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Specialties */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Specialties
//                   </label>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
//                     {commonSpecialties.map((item) => (
//                       <button
//                         key={item}
//                         type="button"
//                         onClick={() => toggleArrayItem('specialties', item)}
//                         className={`px-3 py-2 text-sm rounded-lg border-2 transition ${
//                           formData.specialties.includes(item)
//                             ? 'border-green-600 bg-green-50 text-green-700 font-medium'
//                             : 'border-gray-200 hover:border-green-300 text-gray-700'
//                         }`}
//                       >
//                         {item}
//                       </button>
//                     ))}
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Add custom specialty (press Enter)"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     onKeyPress={(e) => {
//                       if (e.key === 'Enter') {
//                         e.preventDefault();
//                         addCustomItem('specialties', e.target.value);
//                         e.target.value = '';
//                       }
//                     }}
//                   />
//                   {formData.specialties.length > 0 && (
//                     <div className="mt-3 flex flex-wrap gap-2">
//                       {formData.specialties.map((item) => (
//                         <span
//                           key={item}
//                           className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
//                         >
//                           {item}
//                           <button
//                             type="button"
//                             onClick={() => removeItem('specialties', item)}
//                             className="hover:text-red-600"
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Tags */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Relevant Tags (Optional)
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Add tags separated by commas or press Enter"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     onKeyPress={(e) => {
//                       if (e.key === 'Enter') {
//                         e.preventDefault();
//                         addCustomItem('tags', e.target.value);
//                         e.target.value = '';
//                       }
//                     }}
//                   />
//                   {formData.tags.length > 0 && (
//                     <div className="mt-3 flex flex-wrap gap-2">
//                       {formData.tags.map((item) => (
//                         <span
//                           key={item}
//                           className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
//                         >
//                           <Tag size={14} />
//                           {item}
//                           <button
//                             type="button"
//                             onClick={() => removeItem('tags', item)}
//                             className="hover:text-red-600"
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Insurance Coverage */}
//             {currentStep === 3 && (
//               <div className="space-y-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//                     <Shield className="w-6 h-6 text-blue-600" />
//                     Insurance Coverage
//                   </h2>
//                   <p className="text-gray-600 text-sm">Select the HMOs you accept</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     Supported HMOs
//                   </label>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {availableHMOs.map((hmo) => (
//                       <button
//                         key={hmo}
//                         type="button"
//                         onClick={() => toggleArrayItem('supportedHMOs', hmo)}
//                         className={`px-4 py-3 text-left rounded-lg border-2 transition flex items-center gap-3 ${
//                           formData.supportedHMOs.includes(hmo)
//                             ? 'border-green-600 bg-green-50 text-green-700 font-medium'
//                             : 'border-gray-200 hover:border-green-300 text-gray-700'
//                         }`}
//                       >
//                         <Shield className={`w-5 h-5 ${
//                           formData.supportedHMOs.includes(hmo) ? 'text-green-600' : 'text-gray-400'
//                         }`} />
//                         <span>{hmo}</span>
//                         {formData.supportedHMOs.includes(hmo) && (
//                           <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                   {formData.supportedHMOs.length > 0 && (
//                     <div className="mt-4 p-4 bg-green-50 rounded-lg">
//                       <p className="text-sm font-medium text-green-900 mb-2">
//                         Selected HMOs ({formData.supportedHMOs.length})
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {formData.supportedHMOs.map((hmo) => (
//                           <span
//                             key={hmo}
//                             className="px-3 py-1 bg-white text-green-700 rounded-full text-sm font-medium"
//                           >
//                             {hmo}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Navigation Buttons */}
//             <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
//               {currentStep > 1 && (
//                 <button
//                   onClick={handlePrevious}
//                   className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
//                 >
//                   <ArrowLeft size={20} />
//                   Previous
//                 </button>
//               )}
//               {currentStep < 3 ? (
//                 <button
//                   onClick={handleNext}
//                   className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
//                 >
//                   Next
//                   <ArrowRight size={20} />
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleSubmit}
//                   className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
//                 >
//                   <CheckCircle size={20} />
//                   Submit Application
//                 </button>
//               )}
//             </div>
//         </div>

//         {/* Help Section */}
//         <div className="mt-8 bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
//           <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
//             <div className="flex items-center gap-2">
//               <Phone className="w-5 h-5 text-blue-600" />
//               <span>(555) 987-PROV</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Mail className="w-5 h-5 text-green-600" />
//               <span>partners@healthprovida.com</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default JoinProviderPage;

import React, { useState } from 'react';
import { Briefcase, Mail, MapPin, Phone, User, CheckCircle, ArrowRight, ArrowLeft, Stethoscope, Shield, Tag, Clock, Upload, Plus, Trash2, Image } from 'lucide-react';

// Pre-registered HMOs
const availableHMOs = [
  "Hygeia HMO",
  "Avon Healthcare",
  "Reliance HMO",
  "AXA Mansard",
  "MetroHealth HMO",
  "Apex Healthcare",
  "Total Health Trust",
  "Wellness HMO",
  "Sterling Health HMO",
  "Clearline HMO"
];

// Common equipment options
const commonEquipment = [
  "X-Ray Machine",
  "Ultrasound",
  "ECG Monitor",
  "CT Scan",
  "MRI Machine",
  "Laboratory",
  "Pharmacy",
  "Operating Theater",
  "ICU Facilities",
  "Dental Equipment",
  "Dialysis Machine",
  "Ambulance"
];

// Common specialties
const commonSpecialties = [
  "General Practice",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Gynecology",
  "Ophthalmology",
  "Dentistry",
  "Surgery",
  "Emergency Medicine",
  "Radiology",
  "Neurology"
];

// Days of the week for operating hours
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MultiStepProviderForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    practitionerName: '',
    practitionerType: '',
    email: '',
    phone: '',
    address: '',
    // Step 2
    equipment: [],
    tags: [],
    specialties: [],
    // Step 3
    supportedHMOs: [],
    // Step 4
    facilityImage: null,
    facilityImagePreview: '',
    operatingHours: daysOfWeek.map(day => ({
      day,
      isOpen: day !== 'Sunday',
      openTime: '08:00',
      closeTime: '17:00'
    })),
    appointmentSlotDuration: '30'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const addCustomItem = (field, value) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const removeItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          facilityImage: file,
          facilityImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateOperatingHours = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.operatingHours];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, operatingHours: updated };
    });
  };

  const validateStep1 = () => {
    return formData.practitionerName && 
           formData.practitionerType && 
           formData.email && 
           formData.phone && 
           formData.address;
  };

  const validateStep2 = () => {
    return formData.equipment.length > 0 || 
           formData.specialties.length > 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      alert('Please fill in all required fields');
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      alert('Please select at least one equipment or specialty');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Registration submitted successfully! We will review your application and get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Join the HealthProvida Network
          </h1>
          <p className="text-gray-600">Register your healthcare facility in 3 easy steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center z-10">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step ? <CheckCircle size={20} /> : step}
                    </div>
                    <span className="text-xs md:text-sm text-gray-600 mt-2 text-center whitespace-nowrap">
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Services'}
                      {step === 3 && 'Insurance'}
                      {step === 4 && 'Hours & Photos'}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className="flex-1 h-1 bg-gray-200 mx-2 md:mx-4 relative" style={{ top: '-14px' }}>
                      <div 
                        className={`h-full transition-all duration-300 ${
                          currentStep > index + 1 ? 'bg-blue-600 w-full' : 'bg-gray-200 w-0'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Basic Information
                  </h2>
                  <p className="text-gray-600 text-sm">Tell us about your healthcare facility</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Practitioner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="practitionerName"
                      value={formData.practitionerName}
                      onChange={handleInputChange}
                      placeholder="e.g., Dr. Sarah Johnson Medical Center"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Practitioner Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="practitionerType"
                      value={formData.practitionerType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Multi-specialty Clinic / General Practice">Multi-specialty Clinic / General Practice</option>
                      <option value="General Hospital / Specialist Care">General Hospital / Specialist Care</option>
                      <option value="Tertiary Care Hospital / National Referral Center">Tertiary Care Hospital / National Referral Center</option>
                      <option value="Private Multi-specialty Clinic">Private Multi-specialty Clinic</option>
                      <option value="Fertility & Reproductive Health Clinic">Fertility & Reproductive Health Clinic</option>
                      <option value="Reproductive Health & Family Planning Clinic">Reproductive Health & Family Planning Clinic</option>
                      <option value="General Private Hospital">General Private Hospital</option>
                      <option value="Private General Hospital">Private General Hospital</option>
                      <option value="Specialist Surgical Hospital">Specialist Surgical Hospital</option>
                      <option value="Diagnostic Center">Diagnostic Center</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Dental Clinic">Dental Clinic</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="contact@clinic.com"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+234 123 456 7890"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Physical Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Health Street, Medical District, Lagos"
                        rows="3"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Services & Facilities */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                    Services & Facilities
                  </h2>
                  <p className="text-gray-600 text-sm">What services and equipment do you offer?</p>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Equipment
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonEquipment.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArrayItem('equipment', item)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition ${
                          formData.equipment.includes(item)
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add custom equipment (press Enter)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('equipment', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  {formData.equipment.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.equipment.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeItem('equipment', item)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialties
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonSpecialties.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArrayItem('specialties', item)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition ${
                          formData.specialties.includes(item)
                            ? 'border-green-600 bg-green-50 text-green-700 font-medium'
                            : 'border-gray-200 hover:border-green-300 text-gray-700'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add custom specialty (press Enter)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('specialties', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  {formData.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.specialties.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeItem('specialties', item)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relevant Tags (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Add tags separated by commas or press Enter"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('tags', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  {formData.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.tags.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                        >
                          <Tag size={14} />
                          {item}
                          <button
                            type="button"
                            onClick={() => removeItem('tags', item)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Insurance Coverage */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Insurance Coverage
                  </h2>
                  <p className="text-gray-600 text-sm">Select the HMOs you accept</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Supported HMOs
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableHMOs.map((hmo) => (
                      <button
                        key={hmo}
                        type="button"
                        onClick={() => toggleArrayItem('supportedHMOs', hmo)}
                        className={`px-4 py-3 text-left rounded-lg border-2 transition flex items-center gap-3 ${
                          formData.supportedHMOs.includes(hmo)
                            ? 'border-green-600 bg-green-50 text-green-700 font-medium'
                            : 'border-gray-200 hover:border-green-300 text-gray-700'
                        }`}
                      >
                        <Shield className={`w-5 h-5 ${
                          formData.supportedHMOs.includes(hmo) ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <span>{hmo}</span>
                        {formData.supportedHMOs.includes(hmo) && (
                          <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  {formData.supportedHMOs.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-2">
                        Selected HMOs ({formData.supportedHMOs.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.supportedHMOs.map((hmo) => (
                          <span
                            key={hmo}
                            className="px-3 py-1 bg-white text-green-700 rounded-full text-sm font-medium"
                          >
                            {hmo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Operating Hours & Facility Image */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Operating Hours & Facility Photos
                  </h2>
                  <p className="text-gray-600 text-sm">Set your availability and upload a facility image</p>
                </div>

                {/* Facility Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Image className="inline w-4 h-4 mr-1 mb-0.5" />
                    Facility Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
                    {formData.facilityImagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={formData.facilityImagePreview}
                          alt="Facility preview"
                          className="mx-auto max-h-48 rounded-lg object-cover shadow-md"
                        />
                        <div className="flex items-center justify-center gap-3">
                          <label className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition flex items-center gap-2">
                            <Upload size={16} />
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, facilityImage: null, facilityImagePreview: '' }))}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="mx-auto w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">Click to upload a facility image</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG, or WebP up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Appointment Slot Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Slot Duration
                  </label>
                  <select
                    name="appointmentSlotDuration"
                    value={formData.appointmentSlotDuration}
                    onChange={handleInputChange}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Clock className="inline w-4 h-4 mr-1 mb-0.5" />
                    Operating Hours
                  </label>
                  <div className="space-y-3">
                    {formData.operatingHours.map((dayData, index) => (
                      <div
                        key={dayData.day}
                        className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-3 rounded-lg border-2 transition ${
                          dayData.isOpen
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => updateOperatingHours(index, 'isOpen', !dayData.isOpen)}
                            className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${
                              dayData.isOpen ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                              dayData.isOpen ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                          <span className={`font-medium text-sm ${
                            dayData.isOpen ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {dayData.day}
                          </span>
                        </div>

                        {dayData.isOpen && (
                          <div className="flex items-center gap-2 text-sm">
                            <input
                              type="time"
                              value={dayData.openTime}
                              onChange={(e) => updateOperatingHours(index, 'openTime', e.target.value)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500 font-medium">to</span>
                            <input
                              type="time"
                              value={dayData.closeTime}
                              onChange={(e) => updateOperatingHours(index, 'closeTime', e.target.value)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {!dayData.isOpen && (
                          <span className="text-sm text-gray-400 italic">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Submit Application
                </button>
              )}
            </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              <span>(555) 987-PROV</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span>partners@healthprovida.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}