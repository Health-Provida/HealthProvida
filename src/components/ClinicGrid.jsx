import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Clock, Heart, X, Calendar, Shield, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';
import { useClinics } from '@/context/ClinicsContext';
import { getClinicUrl } from '@/utils/slugUtils';


// This component wraps around your existing ClinicGrid
// You'll need to export clinicsData from your ClinicGrid.jsx file

// Import your images
import imageone from '../components/ui/imageone.png'
import imagetwo from '../components/ui/imagetwo.png'
import imagethree from '../components/ui/imagethree.png'
import imagefour from '../components/ui/imagefour.png'
import imagefive from '../components/ui/imagefive.png'
import imagesix from '../components/ui/imagesix.png'
import imageseven from '../components/ui/imageseven.png'
import imageeight from '../components/ui/imageeight.png'
import imagenine from '../components/ui/imagenine.png'

import imgGeneralWard from '../assets/gallery/general_patient_ward_1777236735231.png';
import imgIcuWard from '../assets/gallery/hospital_icu_ward_1777237063443.png';
import imgMaternity from '../assets/gallery/maternity_delivery_room_1777237046917.png';
import imgReception from '../assets/gallery/modern_hospital_reception_1777236657236.png';
import imgOperatingTheater from '../assets/gallery/modern_operating_theater_1777236986447.png';
import imgPrivateRoom from '../assets/gallery/private_patient_room_1777236673043.png';
import imgNationalCancerInstitute from '../assets/gallery/national-cancer-institute-aelk4Tn0vlI-unsplash.jpg';
import imgOutpatientArea from '../assets/gallery/outpatient_area.jpg';
import imgPhlebotomyRoom from '../assets/gallery/phlebotomy_room.jpg';
import imgSemiPrivateWard from '../assets/gallery/semi_private_ward.jpg';

// To avoid hitting rate limits, using realistic unsplash placeholder images to supplement the generated ones.
export const commonGallery = [
  {
    id: 'reception',
    title: 'Reception',
    description: 'Modern, comfortable seating, 24/7 front desk, and a welcoming environment for all patients and visitors.',
    images: [
      imgReception,
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'ent_area',
    title: 'Outpatient Area',
    description: 'Walk-in consultations, diagnostics, and treatments — no overnight stay required. Swift service in a calm, well-organised space.',
    images: [
      imgOutpatientArea,
      'https://images.unsplash.com/photo-1580281657702-257584239a55?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1562243057-02dae7bb3bb4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'phlebotomy_room',
    title: 'Phlebotomy Room',
    description: 'Clean, dedicated space for blood draws and specimen collection, staffed by trained phlebotomists for a safe and comfortable experience.',
    images: [
      imgPhlebotomyRoom,
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'consulting_room',
    title: 'Consulting Room',
    description: 'Private and comfortable consulting rooms designed to facilitate open communication and comprehensive medical examinations.',
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'private_ward',
    title: 'Private Ward',
    description: 'En-suite private rooms with personalised nursing care and space for a loved one — rest, dignity, and peace of mind throughout recovery.',
    images: [
      imgPrivateRoom,
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'semi_private_ward',
    title: 'Semi-Private Ward',
    description: 'Shared inpatient rooms with attentive nursing care, essential amenities, and comfortable recovery beds — quality care at great value.',
    images: [
      imgSemiPrivateWard,
      imgGeneralWard,
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    description: 'State-of-the-art diagnostic laboratory equipped with advanced technology for accurate and timely test results.',
    images: [
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
      imgNationalCancerInstitute,
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'special_units',
    title: 'Special Units',
    description: 'Dedicated intensive care and maternity units with advanced life support systems and specialized nursing.',
    images: [
      imgIcuWard,
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      imgMaternity,
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

// Clinic data (copied from your original file)
export const clinicsData = [
  {
    id: 1,
    image_src: imageone,
    practitioner_name: "Wellington Clinics",
    practice_type: "Multi-specialty Clinic / General Practice",
    address: "Plot 321 Gidan Fulani Street, Lifecamp, Abuja 900108, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 245,
    distance_from_location: "10 km",
    phone: "+234 901 234 5678",
    tags: ["General Practice", "Family Medicine", "Telemedicine Available", "Diagnostic Services", "Preventative Care", "Telehealth Available", "Walk-in Clinic"],
    operatingHours: "24 Hours",
    specialties: ["Family Medicine", "Pediatrics", "Women's Health", "Vaccinations", "Health Screenings"],
    supportedHMOs: ["Hygeia HMO", "Avon Healthcare", "Reliance HMO", "AXA Mansard"],
    equipment: ["X-Ray Machine", "Ultrasound", "ECG Monitor", "Laboratory", "Pharmacy"],
    timeSlots: [
      { day: "Today", slots: ["2:00 PM", "4:30 PM"] },
      { day: "Tomorrow", slots: ["9:00 AM", "10:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Amina O.", rating: 5, date: "April 2026", text: "The staff at Wellington Clinics are incredibly warm and professional. Dr. Eze took time to explain everything about my condition and treatment options. The facility is spotless." },
      { author: "Chidi N.", rating: 5, date: "March 2026", text: "Best walk-in clinic experience I've had in Abuja. Minimal wait time and the diagnostic services are top-notch. Highly recommend for family medicine." },
      { author: "Fatima B.", rating: 4, date: "March 2026", text: "Very clean and organized. The pediatrics department is fantastic — my children feel comfortable here. Only wish the parking was bigger." },
    ],
  },
  {
    id: 2,
    image_src: imagetwo,
    practitioner_name: "Alliance Hospital",
    practice_type: "General Hospital / Specialist Care",
    address: "No. 5 Malumfashi Close, Off Emeka Anyaoku Street, Area 11, Garki, F.C.T, Abuja.",
    rating: 4.8,
    number_of_reviews: 310,
    distance_from_location: "5 km",
    phone: "+234 902 345 6789",
    tags: ["General Surgery", "Cardiology", "Orthopedics", "Emergency Services", "Intensive Care", "Specialist Consultations"],
    operatingHours: "24 Hours",
    specialties: ["Cardiology", "Orthopedics", "Surgery", "Emergency Medicine", "Radiology"],
    supportedHMOs: ["Hygeia HMO", "MetroHealth HMO", "Apex Healthcare", "Total Health Trust"],
    equipment: ["CT Scan", "MRI Machine", "Digital X-Ray", "ICU Facilities", "Operating Theaters"],
    timeSlots: [
      { day: "Today", slots: ["3:00 PM", "5:00 PM"] },
      { day: "Tomorrow", slots: ["8:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"] },
      { day: "Wednesday", slots: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Emeka A.", rating: 5, date: "April 2026", text: "Alliance Hospital saved my father's life during a cardiac emergency. The cardiology team is world-class and the ICU facilities are state-of-the-art." },
      { author: "Grace I.", rating: 5, date: "March 2026", text: "Had my knee surgery here and the orthopedics department exceeded all expectations. Recovery room was comfortable and the nurses were attentive 24/7." },
      { author: "Yusuf M.", rating: 4, date: "February 2026", text: "Excellent emergency services. The CT scan and MRI results came back quickly. Staff communication could be slightly better during peak hours." },
    ],
  },
  {
    id: 3,
    image_src: imagethree,
    practitioner_name: "National Hospital Abuja",
    practice_type: "Tertiary Care Hospital / National Referral Center",
    address: "PMB 425 Ali Muhammad Zarah Street, Central Business Dis, Abuja 900103, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 550,
    distance_from_location: "3 km",
    phone: "+234 903 456 7890",
    operatingHours: "Mon–Fri 8am–5pm",
    tags: ["Tertiary Care", "Research Hospital", "Specialized Surgery", "Pediatrics", "Oncology", "Public Health"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Dr. Okonkwo R.", rating: 5, date: "April 2026", text: "As a referring physician, I trust National Hospital for complex cases. Their tertiary care is unmatched in the FCT with excellent surgical outcomes." },
      { author: "Blessing U.", rating: 5, date: "March 2026", text: "The oncology department provided compassionate and thorough care for my mother. Every step of her treatment was explained clearly to our family." },
      { author: "Suleiman D.", rating: 4, date: "February 2026", text: "Great research hospital with knowledgeable specialists. Wait times can be long due to high patient volume, but the quality of care makes it worthwhile." },
    ],
  },
  {
    id: 4,
    image_src: imagefour,
    practitioner_name: "Abuja Clinics",
    practice_type: "Private Multi-specialty Clinic",
    address: "22 Amazon St, Maitama, Abuja 904101, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 240,
    distance_from_location: "10 km",
    phone: "+234 904 567 8901",
    operatingHours: "Mon–Sat 9am–9pm",
    tags: ["Premium Healthcare", "Executive Check-ups", "Diagnostic Imaging", "Family Health", "Women's Health", "Urgent Care"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Ngozi K.", rating: 5, date: "April 2026", text: "Premium healthcare at its finest. The executive check-up package was thorough — they caught an issue early that another clinic missed entirely." },
      { author: "Tunde S.", rating: 5, date: "March 2026", text: "Abuja Clinics' Maitama branch is immaculate. The diagnostic imaging is fast and the doctors are very experienced. My family's go-to clinic." },
      { author: "Halima J.", rating: 4, date: "February 2026", text: "The women's health department is excellent. Felt very safe and cared for. Slightly pricey but absolutely worth it for the quality." },
    ],
  },
  {
    id: 5,
    image_src: imagefive,
    practitioner_name: "Aquila Clinic and Fertility",
    practice_type: "Fertility & Reproductive Health Clinic",
    address: "Zone A, Apo Legislative Quarters, 21 Tatari Ali Cl, Garki, Abuja 900110, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 120,
    distance_from_location: "8 km",
    phone: "+234 905 678 9012",
    operatingHours: "Mon–Sat 8am–6pm",
    tags: ["IVF", "Reproductive Medicine", "Gynecological Services", "Male Fertility", "Counseling Services", "Women's Health"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Chioma E.", rating: 5, date: "April 2026", text: "After years of struggling, Dr. Adeyemi at Aquila gave us hope. The IVF process was explained step by step and we finally have our miracle baby." },
      { author: "Ibrahim T.", rating: 5, date: "March 2026", text: "The male fertility counseling was handled with great sensitivity and professionalism. The lab facilities are modern and the results were accurate." },
      { author: "Aisha W.", rating: 4, date: "February 2026", text: "Excellent reproductive health clinic. The gynecological services are comprehensive. Appointments are sometimes hard to get due to high demand." },
    ],
  },
  {
    id: 6,
    image_src: imagesix,
    practitioner_name: "Marie Stopes Medical Centre, Abuja",
    practice_type: "Reproductive Health & Family Planning Clinic",
    address: "Plot 45, Wuse II District, Abuja F.C.T, Nigeria.",
    rating: 4.8,
    number_of_reviews: 95,
    distance_from_location: "6 km",
    phone: "+234 906 789 0123",
    operatingHours: "Mon–Fri 9am–5pm",
    tags: ["Family Planning", "Contraception", "Women's Health", "Maternal Health", "Sexual Health", "Counseling Services"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Funke A.", rating: 5, date: "April 2026", text: "Marie Stopes provided exceptional maternal care throughout my pregnancy. The family planning counseling was informative and non-judgmental." },
      { author: "Maryam L.", rating: 5, date: "March 2026", text: "Very professional and confidential service. The staff made me feel comfortable discussing sensitive health topics. Clean and well-organized facility." },
      { author: "Joy P.", rating: 4, date: "February 2026", text: "Affordable reproductive health services with caring staff. The Wuse II location is convenient. Would appreciate extended weekend hours." },
    ],
  },
  {
    id: 7,
    image_src: imageseven,
    practitioner_name: "Garki Hospital Abuja",
    practice_type: "General Private Hospital",
    address: "Tafawa Balewa Way, Garki, Abuja.",
    rating: 4.8,
    number_of_reviews: 280,
    distance_from_location: "4 km",
    phone: "+234 907 890 1234",
    operatingHours: "24 Hours",
    tags: ["General Medicine", "Pediatrics", "Surgery", "Diagnostics", "Pharmacy Services", "Emergency Department"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Obinna C.", rating: 5, date: "April 2026", text: "Garki Hospital's emergency department is outstanding. Was seen within minutes and the treatment was efficient. The pharmacy on-site is very convenient." },
      { author: "Zainab H.", rating: 5, date: "March 2026", text: "Brought my son to pediatrics and the doctors were wonderful with children. The diagnostics were thorough and we got results the same day." },
      { author: "Kenneth O.", rating: 4, date: "February 2026", text: "Reliable general hospital with good surgical outcomes. The facility is well-maintained and the location on Tafawa Balewa Way is very accessible." },
    ],
  },
  {
    id: 8,
    image_src: imageeight,
    practitioner_name: "Nizamiye Hospital (Life Camp)",
    practice_type: "Private General Hospital",
    address: "Plot 101, Life Camp Junction, Abuja F.C.T, Nigeria.",
    rating: 4.8,
    number_of_reviews: 150,
    distance_from_location: "11 km",
    phone: "+234 908 901 2345",
    operatingHours: "24 Hours",
    tags: ["International Healthcare", "Advanced Diagnostics", "Cardiology", "Neurosurgery", "Orthopedic Surgery", "Patient-Centric Care"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Adaeze M.", rating: 5, date: "April 2026", text: "Nizamiye Hospital feels like an international-standard facility right here in Abuja. The cardiology team performed my husband's procedure flawlessly." },
      { author: "Rasheed B.", rating: 5, date: "March 2026", text: "Advanced diagnostics and patient-centric care. The neurosurgery department is staffed with experts. The Life Camp location has ample parking too." },
      { author: "Patricia N.", rating: 4, date: "February 2026", text: "Top-tier orthopedic surgery. My recovery was smooth thanks to excellent post-operative care. Slightly far from city center but worth the drive." },
    ],
  },
  {
    id: 9,
    image_src: imagenine,
    practitioner_name: "Kelina Hospital (Gwarimpa)",
    practice_type: "Specialist Surgical Hospital",
    address: "Road 69, Gwarimpa Estate, Abuja F.C.T, Nigeria.",
    rating: 4.8,
    number_of_reviews: 110,
    distance_from_location: "15 km",
    phone: "+234 909 012 3456",
    operatingHours: "Mon–Sat 8am–8pm",
    tags: ["General Surgery", "Urology", "Laparoscopic Surgery", "Endoscopy", "Critical Care", "Post-operative Rehabilitation"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    reviewHighlights: [
      { author: "Victor E.", rating: 5, date: "April 2026", text: "Kelina Hospital's laparoscopic surgery team is exceptional. Minimally invasive, quick recovery, and the surgeons explained every step beforehand." },
      { author: "Comfort A.", rating: 5, date: "March 2026", text: "The urology department at Gwarimpa branch is very professional. Endoscopy was quick and painless. The post-operative rehab program was very helpful." },
      { author: "Daniel U.", rating: 4, date: "February 2026", text: "Good specialist surgical hospital. Critical care unit is well-equipped. The only downside is the distance from the city center — 15km away." },
    ],
  }
];

// Mock operating hours mapping for demo display
const MOCK_HOURS_MAP = {
  1: "24 Hours",
  2: "24 Hours",
  3: "Mon–Fri 8:00 AM – 5:00 PM",
  4: "Mon–Sat 9:00 AM – 9:00 PM",
  5: "Mon–Sat 8:00 AM – 6:00 PM",
  6: "Mon–Fri 9:00 AM – 5:00 PM",
  7: "24 Hours",
  8: "24 Hours",
  9: "Mon–Sat 8:00 AM – 8:00 PM",
};

const DEFAULT_MOCK_HOURS = [
  "24 Hours",
  "Mon–Fri 9:00 AM – 5:00 PM",
  "Mon–Sat 8:00 AM – 8:00 PM",
  "Mon–Sat 9:00 AM – 6:00 PM",
  "24 Hours",
  "Mon–Fri 8:00 AM – 6:00 PM",
];

export function getClinicMockOperatingHours(clinic) {
  if (clinic?.operatingHours) return clinic.operatingHours;
  if (clinic?.operating_hours) return clinic.operating_hours;
  if (clinic?.id && MOCK_HOURS_MAP[clinic.id]) return MOCK_HOURS_MAP[clinic.id];

  const typeOrName = `${clinic?.practice_type || ''} ${clinic?.practitioner_name || ''}`.toLowerCase();
  if (typeOrName.includes('hospital') || typeOrName.includes('emergency') || typeOrName.includes('tertiary')) {
    return '24 Hours';
  }

  const idNum = typeof clinic?.id === 'number' ? clinic.id : (clinic?.practitioner_name?.length || 0);
  return DEFAULT_MOCK_HOURS[Math.abs(idNum) % DEFAULT_MOCK_HOURS.length];
}

function ClinicDialog({ clinic, isOpen, onClose }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!isOpen) return null;

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }
    alert(`Appointment booked for ${selectedSlot.day} at ${selectedSlot.time}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
            <img
              src={clinic.image_src}
              alt={clinic.practitioner_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
              loading="lazy"
              decoding="async"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{clinic.practitioner_name}</h2>
              <p className="text-sm sm:text-base text-blue-600 font-medium truncate">{clinic.practice_type}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{clinic.rating}</span>
                  <span className="ml-1 text-gray-600">({clinic.number_of_reviews})</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{clinic.distance_from_location}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 p-1"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Location & Contact
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-gray-600">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                <span>{clinic.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${clinic.phone}`} className="hover:text-blue-600">{clinic.phone}</a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Operating Hours: <span className="text-gray-900 font-medium">{getClinicMockOperatingHours(clinic)}</span></span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {clinic.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Supported HMOs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {clinic.supportedHMOs.map((hmo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs sm:text-sm text-gray-700"
                >
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <span>{hmo}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Available Equipment & Facilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {clinic.equipment.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-700"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Available Time Slots
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {clinic.timeSlots.map((daySlot, dayIndex) => (
                <div key={dayIndex}>
                  <p className="font-medium text-sm sm:text-base text-gray-700 mb-2">{daySlot.day}</p>
                  <div className="flex flex-wrap gap-2">
                    {daySlot.slots.map((time, timeIndex) => (
                      <button
                        key={timeIndex}
                        onClick={() => setSelectedSlot({ day: daySlot.day, time })}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border-2 transition ${selectedSlot?.day === daySlot.day && selectedSlot?.time === time
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleBookAppointment}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition"
            >
              Book Appointment
            </button>
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicCard({ clinic, onClick }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(clinic.id);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 p-3.5 sm:p-4 md:p-5 cursor-pointer border border-gray-100 flex flex-row gap-3.5 sm:gap-5 md:gap-6 items-center"
    >
      <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 aspect-square rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-green-100">
        <img
          className="w-full h-full object-cover"
          alt={`${clinic.practitioner_name} medical facility`}
          src={clinic.image_src}
          loading="lazy"
          decoding="async"
        />
        {clinic.tags && clinic.tags[0] && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-blue-50/90 backdrop-blur-sm text-blue-700 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs truncate max-w-[85%]">
            {clinic.tags[0]}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1.5 sm:space-y-2.5 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">{clinic.practitioner_name}</h3>
            <p className="text-xs sm:text-sm text-blue-600 font-medium truncate mt-0.5">{clinic.practice_type}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(clinic.id);
            }}
            className={`p-2 rounded-full flex-shrink-0 transition-all duration-200 hover:bg-gray-100 ${favorited ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
              }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
          <span className="truncate">{clinic.address}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center">
            <Phone className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
            <span className="truncate">{clinic.phone}</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
            <span className="text-gray-600">{getClinicMockOperatingHours(clinic)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm pt-0.5 sm:pt-1">
          <div className="flex items-center text-gray-900 font-semibold">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1 flex-shrink-0" />
            <span>{clinic.rating}</span>
            <span className="ml-1 text-gray-500 font-normal">({clinic.number_of_reviews} reviews)</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{clinic.distance_from_location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {clinic.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClinicCardsApp() {
  const navigate = useNavigate();
  const { clinics, loading, error } = useClinics();
  const [sortedClinics, setSortedClinics] = useState([]);

  // Sort by popularity: most reviews first, then by rating as tiebreaker
  useEffect(() => {
    if (clinics.length > 0) {
      const results = [...clinics].sort((a, b) => {
        const reviewDiff = (b.number_of_reviews || 0) - (a.number_of_reviews || 0);
        if (reviewDiff !== 0) return reviewDiff;
        return (b.rating || 0) - (a.rating || 0);
      });
      setSortedClinics(results);
    }
  }, [clinics]);

  const navigateToClinic = (clinic) => {
    window.open(getClinicUrl(clinic), '_blank');
  };

  return (
    <div className="min-h-0 sm:min-h-screen bg-transparent sm:bg-gray-50 p-0 sm:p-6 lg:p-8 rounded-none sm:rounded-xl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8 px-1 sm:px-0">
          <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Most Popular Clinics</h1>
          <p className="text-xs sm:text-base text-gray-600">Verified providers across Sub-Saharan Africa — ranked by patient bookings</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            // Skeleton loading cards
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-3.5 sm:p-4 border border-gray-100 animate-pulse flex flex-row gap-3.5 sm:gap-5 md:gap-6 items-center">
                <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 aspect-square rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                <div className="flex-1 space-y-3 min-w-0 py-1">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-md w-1/2" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded-md w-full" />
                  <div className="flex gap-3">
                    <div className="h-4 bg-gray-200 rounded-md w-24" />
                    <div className="h-4 bg-gray-200 rounded-md w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : sortedClinics.length > 0 ? (
            sortedClinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                onClick={() => navigateToClinic(clinic)}
              />
            ))
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-900 text-lg font-semibold mb-2">Unable to load clinics</p>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2 px-6 rounded-lg font-medium transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 text-lg">No clinics available at this time.</p>
              <p className="text-gray-500 mt-2">Please check back soon.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
