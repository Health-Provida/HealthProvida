export type OrderStatus =
  | "new"
  | "awaiting_sample"
  | "processing"
  | "results_ready"
  | "completed"
  | "cancelled";

export type SampleStatus = "awaiting" | "collected" | "processing" | "completed";
export type ResultStatus = "pending" | "processing" | "review" | "published";
export type CollectionType = "home" | "walkin";

export interface TestItem {
  name: string;
  price: number;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  payer: string;
  tests: TestItem[];
  collection: CollectionType;
  address?: string;
  branch?: string;
  collectionDate: string;
  collectionTime: string;
  instructions?: string;
  status: OrderStatus;
  orderedAt: string;
  sampleId?: string;
}

export interface Sample {
  id: string;
  orderId: string;
  patientName: string;
  test: string;
  collection: CollectionType;
  collectionTime: string;
  status: SampleStatus;
}

export interface ResultRow {
  analyte: string;
  value: string;
  range: string;
  flag: "Normal" | "High" | "Low";
}

export interface LabResult {
  id: string;
  orderId: string;
  patientName: string;
  patientId: string;
  test: string;
  sampleId: string;
  status: ResultStatus;
  date: string;
  summary: string;
  comment: string;
  rows: ResultRow[];
}

export interface CatalogTest {
  id: string;
  name: string;
  category: string;
  labPrice: number;
  hpPrice: number;
  homeCollection: boolean;
  active: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  payer: string;
  lastTest: string;
  lastOrder: string;
  collection: CollectionType;
  status: "Active" | "Inactive";
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "info" | "success";
  read: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
  type: "info" | "success";
}

export const LAB_NAME = "Meridian Diagnostic Centre";

export const orderStatusLabel: Record<OrderStatus, string> = {
  new: "New",
  awaiting_sample: "Awaiting Sample",
  processing: "Processing",
  results_ready: "Results Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const sampleStatusLabel: Record<SampleStatus, string> = {
  awaiting: "Awaiting Collection",
  collected: "Collected",
  processing: "Processing",
  completed: "Completed",
};

export const resultStatusLabel: Record<ResultStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  review: "Ready for Review",
  published: "Published",
};

export const formatNaira = (value: number) =>
  "₦" + value.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const orderTotal = (order: Order) =>
  order.tests.reduce((sum, t) => sum + t.price, 0);

export const seedOrders: Order[] = [
  {
    id: "HP-LAB-1048",
    patientId: "HP-PT-2201",
    patientName: "Adaeze Okafor",
    age: 32,
    gender: "Female",
    phone: "+234 803 114 2288",
    payer: "HMO — Reliance Health",
    tests: [
      { name: "Full Blood Count", price: 8000 },
      { name: "Malaria Parasite Test", price: 3000 },
    ],
    collection: "home",
    address: "14 Adeola Odeku Street, Victoria Island, Lagos",
    collectionDate: "21 Aug 2026",
    collectionTime: "09:30",
    instructions: "Call on arrival at the gate. Fasting sample.",
    status: "new",
    orderedAt: "21 Aug 2026, 08:40",
  },
  {
    id: "HP-LAB-1047",
    patientId: "HP-PT-2145",
    patientName: "Chinedu Eze",
    age: 41,
    gender: "Male",
    phone: "+234 806 552 9014",
    payer: "Self-pay",
    tests: [{ name: "Lipid Profile", price: 12000 }],
    collection: "walkin",
    branch: "Meridian Ikeja Branch",
    collectionDate: "21 Aug 2026",
    collectionTime: "10:00",
    status: "awaiting_sample",
    orderedAt: "21 Aug 2026, 08:05",
  },
  {
    id: "HP-LAB-1046",
    patientId: "HP-PT-2310",
    patientName: "Fatima Bello",
    age: 27,
    gender: "Female",
    phone: "+234 701 884 2277",
    payer: "HMO — Hygeia",
    tests: [{ name: "Malaria RDT", price: 3000 }],
    collection: "home",
    address: "8 Ogunlana Drive, Surulere, Lagos",
    collectionDate: "21 Aug 2026",
    collectionTime: "10:15",
    instructions: "Patient available before noon.",
    status: "awaiting_sample",
    orderedAt: "21 Aug 2026, 07:52",
  },
  {
    id: "HP-LAB-1045",
    patientId: "HP-PT-2098",
    patientName: "Daniel Adeyemi",
    age: 36,
    gender: "Male",
    phone: "+234 802 447 6633",
    payer: "Hospital — St. Grace Clinic",
    tests: [{ name: "Blood Glucose (Fasting)", price: 4500 }],
    collection: "walkin",
    branch: "Meridian Lekki Branch",
    collectionDate: "21 Aug 2026",
    collectionTime: "08:45",
    status: "processing",
    orderedAt: "21 Aug 2026, 07:20",
    sampleId: "SMP-4405",
  },
  {
    id: "HP-LAB-1044",
    patientId: "HP-PT-2277",
    patientName: "Amaka Nwosu",
    age: 29,
    gender: "Female",
    phone: "+234 809 220 5541",
    payer: "Self-pay",
    tests: [{ name: "Urinalysis", price: 5000 }],
    collection: "home",
    address: "22 Ajose Adeogun Street, Ikeja, Lagos",
    collectionDate: "21 Aug 2026",
    collectionTime: "11:00",
    status: "processing",
    orderedAt: "20 Aug 2026, 17:30",
    sampleId: "SMP-4404",
  },
  {
    id: "HP-LAB-1043",
    patientId: "HP-PT-2412",
    patientName: "Ibrahim Musa",
    age: 45,
    gender: "Male",
    phone: "+234 705 991 3300",
    payer: "HMO — AXA Mansard",
    tests: [{ name: "Widal Test", price: 6000 }],
    collection: "walkin",
    branch: "Meridian Ikeja Branch",
    collectionDate: "20 Aug 2026",
    collectionTime: "15:10",
    status: "results_ready",
    orderedAt: "20 Aug 2026, 14:40",
    sampleId: "SMP-4403",
  },
  {
    id: "HP-LAB-1042",
    patientId: "HP-PT-2201",
    patientName: "Adaeze Okafor",
    age: 32,
    gender: "Female",
    phone: "+234 803 114 2288",
    payer: "HMO — Reliance Health",
    tests: [{ name: "Full Blood Count", price: 8000 }],
    collection: "home",
    address: "14 Adeola Odeku Street, Victoria Island, Lagos",
    collectionDate: "20 Aug 2026",
    collectionTime: "09:00",
    status: "results_ready",
    orderedAt: "20 Aug 2026, 08:15",
    sampleId: "SMP-4402",
  },
  {
    id: "HP-LAB-1041",
    patientId: "HP-PT-2350",
    patientName: "Grace Ojo",
    age: 52,
    gender: "Female",
    phone: "+234 812 663 7788",
    payer: "Self-pay",
    tests: [{ name: "Malaria PCR", price: 25000 }],
    collection: "walkin",
    branch: "Meridian Lekki Branch",
    collectionDate: "19 Aug 2026",
    collectionTime: "12:20",
    status: "completed",
    orderedAt: "19 Aug 2026, 11:00",
    sampleId: "SMP-4401",
  },
  {
    id: "HP-LAB-1040",
    patientId: "HP-PT-2145",
    patientName: "Chinedu Eze",
    age: 41,
    gender: "Male",
    phone: "+234 806 552 9014",
    payer: "Self-pay",
    tests: [
      { name: "Blood Glucose (Fasting)", price: 4500 },
      { name: "Urinalysis", price: 5000 },
    ],
    collection: "home",
    address: "5 Bode Thomas Street, Surulere, Lagos",
    collectionDate: "19 Aug 2026",
    collectionTime: "08:30",
    status: "completed",
    orderedAt: "19 Aug 2026, 07:45",
    sampleId: "SMP-4400",
  },
  {
    id: "HP-LAB-1039",
    patientId: "HP-PT-2480",
    patientName: "Tunde Bakare",
    age: 38,
    gender: "Male",
    phone: "+234 703 118 9922",
    payer: "Hospital — St. Grace Clinic",
    tests: [{ name: "Widal Test", price: 6000 }],
    collection: "walkin",
    branch: "Meridian Ikeja Branch",
    collectionDate: "18 Aug 2026",
    collectionTime: "14:00",
    status: "cancelled",
    orderedAt: "18 Aug 2026, 13:10",
  },
];

export const seedSamples: Sample[] = [
  {
    id: "SMP-4408",
    orderId: "HP-LAB-1047",
    patientName: "Chinedu Eze",
    test: "Lipid Profile",
    collection: "walkin",
    collectionTime: "21 Aug, 10:00",
    status: "awaiting",
  },
  {
    id: "SMP-4407",
    orderId: "HP-LAB-1046",
    patientName: "Fatima Bello",
    test: "Malaria RDT",
    collection: "home",
    collectionTime: "21 Aug, 10:15",
    status: "awaiting",
  },
  {
    id: "SMP-4405",
    orderId: "HP-LAB-1045",
    patientName: "Daniel Adeyemi",
    test: "Blood Glucose (Fasting)",
    collection: "walkin",
    collectionTime: "21 Aug, 08:45",
    status: "processing",
  },
  {
    id: "SMP-4404",
    orderId: "HP-LAB-1044",
    patientName: "Amaka Nwosu",
    test: "Urinalysis",
    collection: "home",
    collectionTime: "21 Aug, 09:10",
    status: "collected",
  },
  {
    id: "SMP-4403",
    orderId: "HP-LAB-1043",
    patientName: "Ibrahim Musa",
    test: "Widal Test",
    collection: "walkin",
    collectionTime: "20 Aug, 15:10",
    status: "completed",
  },
  {
    id: "SMP-4402",
    orderId: "HP-LAB-1042",
    patientName: "Adaeze Okafor",
    test: "Full Blood Count",
    collection: "home",
    collectionTime: "20 Aug, 09:00",
    status: "completed",
  },
];

export const seedResults: LabResult[] = [
  {
    id: "HP-LAB-1042",
    orderId: "HP-LAB-1042",
    patientName: "Adaeze Okafor",
    patientId: "HP-PT-2201",
    test: "Full Blood Count",
    sampleId: "SMP-4402",
    status: "review",
    date: "20 Aug 2026",
    summary: "All measured parameters within reference range.",
    comment: "No haematological abnormality detected. Repeat if symptoms persist.",
    rows: [
      { analyte: "Haemoglobin", value: "13.8 g/dL", range: "12 – 16", flag: "Normal" },
      { analyte: "WBC", value: "6.2 ×10⁹/L", range: "4 – 11", flag: "Normal" },
      { analyte: "Platelets", value: "245 ×10⁹/L", range: "150 – 450", flag: "Normal" },
    ],
  },
  {
    id: "HP-LAB-1043",
    orderId: "HP-LAB-1043",
    patientName: "Ibrahim Musa",
    patientId: "HP-PT-2412",
    test: "Widal Test",
    sampleId: "SMP-4403",
    status: "review",
    date: "20 Aug 2026",
    summary: "Significant titre observed for S. typhi O antigen.",
    comment: "Correlate clinically with patient symptoms.",
    rows: [
      { analyte: "S. typhi O", value: "1:160", range: "< 1:80", flag: "High" },
      { analyte: "S. typhi H", value: "1:80", range: "< 1:80", flag: "Normal" },
    ],
  },
  {
    id: "HP-LAB-1044",
    orderId: "HP-LAB-1044",
    patientName: "Amaka Nwosu",
    patientId: "HP-PT-2277",
    test: "Urinalysis",
    sampleId: "SMP-4404",
    status: "processing",
    date: "21 Aug 2026",
    summary: "",
    comment: "",
    rows: [
      { analyte: "pH", value: "6.0", range: "4.5 – 8.0", flag: "Normal" },
      { analyte: "Protein", value: "Negative", range: "Negative", flag: "Normal" },
    ],
  },
  {
    id: "HP-LAB-1045",
    orderId: "HP-LAB-1045",
    patientName: "Daniel Adeyemi",
    patientId: "HP-PT-2098",
    test: "Blood Glucose (Fasting)",
    sampleId: "SMP-4405",
    status: "pending",
    date: "21 Aug 2026",
    summary: "",
    comment: "",
    rows: [{ analyte: "Fasting glucose", value: "—", range: "3.9 – 5.5 mmol/L", flag: "Normal" }],
  },
  {
    id: "HP-LAB-1041",
    orderId: "HP-LAB-1041",
    patientName: "Grace Ojo",
    patientId: "HP-PT-2350",
    test: "Malaria PCR",
    sampleId: "SMP-4401",
    status: "published",
    date: "19 Aug 2026",
    summary: "Plasmodium falciparum DNA not detected.",
    comment: "Negative for malaria parasite DNA.",
    rows: [
      { analyte: "P. falciparum DNA", value: "Not detected", range: "Not detected", flag: "Normal" },
    ],
  },
  {
    id: "HP-LAB-1040",
    orderId: "HP-LAB-1040",
    patientName: "Chinedu Eze",
    patientId: "HP-PT-2145",
    test: "Blood Glucose (Fasting)",
    sampleId: "SMP-4400",
    status: "published",
    date: "19 Aug 2026",
    summary: "Fasting glucose within normal limits.",
    comment: "Maintain routine monitoring.",
    rows: [
      { analyte: "Fasting glucose", value: "5.1 mmol/L", range: "3.9 – 5.5", flag: "Normal" },
    ],
  },
];

export const seedTests: CatalogTest[] = [
  { id: "T-01", name: "Malaria RDT", category: "Parasitology", labPrice: 2500, hpPrice: 3000, homeCollection: true, active: true },
  { id: "T-02", name: "Malaria PCR", category: "Molecular", labPrice: 21000, hpPrice: 25000, homeCollection: false, active: true },
  { id: "T-03", name: "Full Blood Count", category: "Haematology", labPrice: 6500, hpPrice: 8000, homeCollection: true, active: true },
  { id: "T-04", name: "Lipid Profile", category: "Chemistry", labPrice: 10000, hpPrice: 12000, homeCollection: true, active: true },
  { id: "T-05", name: "Blood Glucose (Fasting)", category: "Chemistry", labPrice: 3500, hpPrice: 4500, homeCollection: true, active: true },
  { id: "T-06", name: "Urinalysis", category: "Chemistry", labPrice: 4000, hpPrice: 5000, homeCollection: true, active: true },
  { id: "T-07", name: "Widal Test", category: "Serology", labPrice: 4800, hpPrice: 6000, homeCollection: false, active: false },
];

export const seedPatients: Patient[] = [
  { id: "HP-PT-2201", name: "Adaeze Okafor", age: 32, gender: "Female", phone: "+234 803 114 2288", payer: "HMO — Reliance Health", lastTest: "Full Blood Count", lastOrder: "HP-LAB-1048", collection: "home", status: "Active" },
  { id: "HP-PT-2145", name: "Chinedu Eze", age: 41, gender: "Male", phone: "+234 806 552 9014", payer: "Self-pay", lastTest: "Lipid Profile", lastOrder: "HP-LAB-1047", collection: "walkin", status: "Active" },
  { id: "HP-PT-2310", name: "Fatima Bello", age: 27, gender: "Female", phone: "+234 701 884 2277", payer: "HMO — Hygeia", lastTest: "Malaria RDT", lastOrder: "HP-LAB-1046", collection: "home", status: "Active" },
  { id: "HP-PT-2098", name: "Daniel Adeyemi", age: 36, gender: "Male", phone: "+234 802 447 6633", payer: "Hospital — St. Grace Clinic", lastTest: "Blood Glucose (Fasting)", lastOrder: "HP-LAB-1045", collection: "walkin", status: "Active" },
  { id: "HP-PT-2277", name: "Amaka Nwosu", age: 29, gender: "Female", phone: "+234 809 220 5541", payer: "Self-pay", lastTest: "Urinalysis", lastOrder: "HP-LAB-1044", collection: "home", status: "Active" },
  { id: "HP-PT-2412", name: "Ibrahim Musa", age: 45, gender: "Male", phone: "+234 705 991 3300", payer: "HMO — AXA Mansard", lastTest: "Widal Test", lastOrder: "HP-LAB-1043", collection: "walkin", status: "Active" },
  { id: "HP-PT-2350", name: "Grace Ojo", age: 52, gender: "Female", phone: "+234 812 663 7788", payer: "Self-pay", lastTest: "Malaria PCR", lastOrder: "HP-LAB-1041", collection: "walkin", status: "Inactive" },
  { id: "HP-PT-2480", name: "Tunde Bakare", age: 38, gender: "Male", phone: "+234 703 118 9922", payer: "Hospital — St. Grace Clinic", lastTest: "Widal Test", lastOrder: "HP-LAB-1039", collection: "walkin", status: "Inactive" },
];

export const seedNotifications: Notification[] = [
  { id: "N-1", title: "New laboratory order received", body: "HP-LAB-1048 · Adaeze Okafor · Full Blood Count", time: "5 minutes ago", type: "info", read: false },
  { id: "N-2", title: "Home collection scheduled", body: "HP-LAB-1046 · Fatima Bello · 21 Aug, 10:15", time: "22 minutes ago", type: "info", read: false },
  { id: "N-3", title: "Sample collected", body: "SMP-4404 · Amaka Nwosu · Urinalysis", time: "38 minutes ago", type: "success", read: false },
  { id: "N-4", title: "Result awaiting review", body: "HP-LAB-1043 · Ibrahim Musa · Widal Test", time: "1 hour ago", type: "info", read: true },
  { id: "N-5", title: "Result successfully delivered", body: "HP-LAB-1040 · Chinedu Eze · Blood Glucose", time: "3 hours ago", type: "success", read: true },
  { id: "N-6", title: "Test price updated", body: "Lipid Profile · Health Provida price now ₦12,000", time: "Yesterday", type: "info", read: true },
];

export const seedActivity: ActivityItem[] = [
  { id: "A-1", title: "New laboratory order received", meta: "HP-LAB-1048 · 5 minutes ago", type: "info" },
  { id: "A-2", title: "Sample collected", meta: "HP-LAB-1045 · 18 minutes ago", type: "success" },
  { id: "A-3", title: "Result uploaded", meta: "HP-LAB-1042 · 31 minutes ago", type: "info" },
  { id: "A-4", title: "Result delivered to patient", meta: "HP-LAB-1039 · 45 minutes ago", type: "success" },
];
