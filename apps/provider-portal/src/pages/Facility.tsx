import { Building2, Camera, ImagePlus, MapPin, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pill, VerificationBadge } from "@/components/provider/status-badges";
import {
  DataField,
  LoadingBlock,
  PageHeading,
  SectionCard,
} from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";

export default function FacilityPage() {
  const store = useProvider();
  const hospital = store.hospital;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!hospital) return;
    setForm({
      name: hospital.name,
      phone: hospital.phone,
      email: hospital.email,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      description: hospital.description,
    });
  }, [hospital]);

  if (!hospital) return <LoadingBlock label="Loading facility profile" />;

  async function save() {
    setSaving(true);
    try {
      await store.updateHospital(form);
    } finally {
      setSaving(false);
    }
  }

  const photoTone = {
    missing: "neutral",
    pending_review: "warning",
    approved: "success",
    rejected: "danger",
  } as const;

  const photoLabel = {
    missing: "Not uploaded",
    pending_review: "Pending review",
    approved: "Approved",
    rejected: "Rejected",
  } as const;

  return (
    <div>
      <PageHeading
        title="Facility Profile"
        description="This is what patients see in Health Provida search results."
        actions={<VerificationBadge state={hospital.verification} />}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid gap-4 xl:col-span-2">
          <SectionCard title="Facility details" description="Contact and location information.">
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="f-name">Facility name</Label>
                <Input
                  id="f-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="f-phone">Phone</Label>
                  <Input
                    id="f-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="f-email">Email</Label>
                  <Input
                    id="f-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f-address">Street address</Label>
                <Input
                  id="f-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="f-city">City / area</Label>
                  <Input
                    id="f-city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="f-state">State</Label>
                  <Input
                    id="f-state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f-desc">About this facility</Label>
                <Textarea
                  id="f-desc"
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={save} disabled={saving}>
                  <Save className="size-4" />
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Facility photographs"
            description="Three photographs are required before verification can be approved."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {hospital.photos.map((photo) => (
                <div key={photo.id} className="rounded-lg border border-border p-3">
                  <div className="grid aspect-4/3 place-items-center overflow-hidden rounded-md bg-muted">
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={`${photo.label} at ${hospital.name}`}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium">{photo.label}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Pill tone={photoTone[photo.status]} dot>
                      {photoLabel[photo.status]}
                    </Pill>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={uploading === photo.slot}
                      onClick={async () => {
                        setUploading(photo.slot);
                        try {
                          await store.uploadPhoto(photo.slot);
                        } finally {
                          setUploading(null);
                        }
                      }}
                    >
                      <Camera className="size-4" />
                      {uploading === photo.slot
                        ? "Uploading…"
                        : photo.url
                          ? "Replace"
                          : "Upload"}
                    </Button>
                  </div>
                  {photo.note ? (
                    <p className="mt-2 text-xs text-muted-foreground">{photo.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 self-start">
          <SectionCard title="Listing summary">
            <div className="grid gap-4">
              <DataField label="Facility type" value={hospital.facilityType} />
              <DataField
                label="Location"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    {hospital.city}, {hospital.state}
                  </span>
                }
              />
              <DataField
                label="Search visibility"
                value={
                  <Pill tone={hospital.visibility === "promoted" ? "brand" : "neutral"}>
                    {visibilityLabel(hospital.visibility)}
                  </Pill>
                }
              />
              <DataField
                label="Specialties"
                value={
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.specialties.map((s) => (
                      <Pill key={s} tone="info">
                        {s}
                      </Pill>
                    ))}
                  </div>
                }
              />
              <DataField label="Doctors listed" value={store.doctors.length} />
              <DataField
                label="Services listed"
                value={store.tariffs.filter((t) => t.status === "active").length}
              />
            </div>
          </SectionCard>

          <SectionCard title="Profile completeness">
            <div className="flex items-start gap-3 rounded-lg bg-neutral-soft p-3">
              <Building2 className="mt-0.5 size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {hospital.photos.every((p) => p.status === "approved")
                  ? "All required photographs are approved. Your listing is fully complete."
                  : "Upload and get all three photographs approved to complete your listing."}
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function visibilityLabel(visibility: "organic" | "promoted") {
  return visibility === "promoted" ? "Promoted placement" : "Organic listing";
}
