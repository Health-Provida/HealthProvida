import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  seedActivity,
  seedNotifications,
  seedOrders,
  seedPatients,
  seedResults,
  seedSamples,
  seedTests,
  type ActivityItem,
  type CatalogTest,
  type LabResult,
  type Notification,
  type Order,
  type OrderStatus,
  type ResultStatus,
  type Sample,
  type SampleStatus,
} from "./lab-data";

interface LabStore {
  orders: Order[];
  samples: Sample[];
  results: LabResult[];
  tests: CatalogTest[];
  patients: typeof seedPatients;
  notifications: Notification[];
  activity: ActivityItem[];
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setSampleStatus: (id: string, status: SampleStatus) => void;
  updateResult: (id: string, patch: Partial<LabResult>) => void;
  setResultStatus: (id: string, status: ResultStatus) => void;
  upsertTest: (test: CatalogTest) => void;
  toggleTest: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  pushActivity: (item: Omit<ActivityItem, "id">) => void;
}

const LabContext = createContext<LabStore | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [samples, setSamples] = useState<Sample[]>(seedSamples);
  const [results, setResults] = useState<LabResult[]>(seedResults);
  const [tests, setTests] = useState<CatalogTest[]>(seedTests);
  const [patients] = useState(seedPatients);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [activity, setActivity] = useState<ActivityItem[]>(seedActivity);

  const value = useMemo<LabStore>(
    () => ({
      orders,
      samples,
      results,
      tests,
      patients,
      notifications,
      activity,
      pushActivity: (item) =>
        setActivity((prev) => [{ id: `A-${Date.now()}`, ...item }, ...prev].slice(0, 8)),
      setOrderStatus: (id, status) =>
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))),
      setSampleStatus: (id, status) =>
        setSamples((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s))),
      updateResult: (id, patch) =>
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
      setResultStatus: (id, status) =>
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))),
      upsertTest: (test) =>
        setTests((prev) =>
          prev.some((t) => t.id === test.id)
            ? prev.map((t) => (t.id === test.id ? test : t))
            : [...prev, test],
        ),
      toggleTest: (id) =>
        setTests((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))),
      markRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    }),
    [orders, samples, results, tests, patients, notifications, activity],
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used inside LabProvider");
  return ctx;
}
