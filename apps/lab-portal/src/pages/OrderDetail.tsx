import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader, Surface, Timeline } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { formatNaira, orderStatusLabel, orderTotal, type OrderStatus } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";

const steps = ["Order received", "Sample collected", "Processing", "Result ready", "Delivered"];
const stepIndex: Record<OrderStatus, number> = {
  new: 0,
  awaiting_sample: 0,
  processing: 2,
  results_ready: 3,
  completed: 4,
  cancelled: 0,
};

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, setOrderStatus, pushActivity } = useLab();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <AppShell>
        <PageHeader title="Order not found" subtitle={`No laboratory order matches ${orderId}.`} />
        <Button asChild variant="outline">
          <Link to="/orders">Back to orders</Link>
        </Button>
      </AppShell>
    );
  }

  const advance = (status: OrderStatus, message: string) => {
    setOrderStatus(order.id, status);
    pushActivity({ title: message, meta: `${order.id} · just now`, type: "success" });
    toast.success(message, { description: order.id });
  };

  return (
    <AppShell>
      <Link
        to="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-brand-blue"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <PageHeader
        title={order.id}
        subtitle={`Ordered ${order.orderedAt} · ${order.payer}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} label={orderStatusLabel[order.status]} />
            {order.status === "new" && (
              <>
                <Button
                  className="bg-brand-blue hover:bg-brand-blue/90"
                  onClick={() => advance("awaiting_sample", "Order accepted")}
                >
                  Accept order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOrderStatus(order.id, "cancelled");
                    toast("Order declined", { description: order.id });
                  }}
                >
                  Decline
                </Button>
              </>
            )}
            {order.status === "awaiting_sample" && (
              <Button
                className="bg-brand-blue hover:bg-brand-blue/90"
                onClick={() => advance("processing", "Sample marked as collected")}
              >
                Mark sample collected
              </Button>
            )}
            {order.status === "processing" && (
              <Button
                className="bg-brand-green hover:bg-brand-green/90"
                onClick={() => {
                  advance("results_ready", "Result marked ready");
                  navigate("/results");
                }}
              >
                Upload result
              </Button>
            )}
            {order.status === "results_ready" && (
              <Button
                className="bg-brand-green hover:bg-brand-green/90"
                onClick={() => advance("completed", "Result delivered to patient")}
              >
                Deliver result
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Surface title="Patient information">
            <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <Field label="Full name" value={order.patientName} />
              <Field label="Patient ID" value={order.patientId} />
              <Field label="Age / Gender" value={`${order.age} · ${order.gender}`} />
              <Field label="Payer" value={order.payer} />
              <Field
                label="Phone"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {order.phone}
                  </span>
                }
              />
            </dl>
          </Surface>

          <Surface title="Requested tests">
            <ul className="divide-y divide-border">
              {order.tests.map((t) => (
                <li key={t.name} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[14px] text-foreground">{t.name}</span>
                  <span className="text-[14px] font-semibold text-foreground">
                    {formatNaira(t.price)}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between bg-secondary/60 px-5 py-3.5">
                <span className="text-[14px] font-semibold text-foreground">Total</span>
                <span className="text-[15px] font-semibold text-brand-blue">
                  {formatNaira(orderTotal(order))}
                </span>
              </li>
            </ul>
          </Surface>

          <Surface title="Collection details">
            <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <Field
                label="Type"
                value={order.collection === "home" ? "Home collection" : "Walk-in visit"}
              />
              <Field label="Scheduled" value={`${order.collectionDate} · ${order.collectionTime}`} />
              <Field
                label={order.collection === "home" ? "Address" : "Branch"}
                value={
                  <span className="inline-flex items-start gap-1.5">
                    {order.collection === "home" ? (
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    {order.address ?? order.branch}
                  </span>
                }
              />
              <Field label="Instructions" value={order.instructions ?? "None provided"} />
            </dl>
          </Surface>
        </div>

        <Surface title="Order timeline">
          <div className="px-5 py-4">
            <Timeline steps={steps} currentIndex={stepIndex[order.status]} />
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-foreground">{value}</dd>
    </div>
  );
}
